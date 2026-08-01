import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const META_API_VERSION = "v18.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

async function sha256hex(value: string): Promise<string> {
  const buf = new TextEncoder().encode(value.toLowerCase().trim());
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Geo cache: maps IP → { result, expiresAt }
// Persists for the lifetime of the Edge Function instance (typically
// 15 min before Deno recycles it). Reduces provider calls by 5-10x.
const GEO_CACHE = new Map<string, { result: Record<string, string>; expiresAt: number }>();

const GEO_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const GEO_TIMEOUT_MS = 1200;

async function fetchJsonWithTimeout(url: string): Promise<any | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(GEO_TIMEOUT_MS) });
    if (!res.ok) {
      await res.body?.cancel();
      return null;
    }
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Best-effort geo enrichment. NEVER throws and NEVER blocks the Meta call
 * for more than GEO_TIMEOUT_MS per provider.
 * Provider order: ipwho.is (HTTPS, keyless) → ip-api.com (HTTP, keyless).
 */
async function getGeoForIp(ip: string): Promise<Record<string, string>> {
  const now = Date.now();

  const cached = GEO_CACHE.get(ip);
  if (cached && cached.expiresAt > now) {
    console.log("[track-meta] geo: cache hit");
    return cached.result;
  }

  try {
    let provider: string | null = null;
    let city: string | undefined;
    let region: string | undefined;
    let zip: string | undefined;
    let country: string | undefined;

    // Provider A: ipwho.is — HTTPS, keyless, IPv4 + IPv6.
    const a = await fetchJsonWithTimeout(`https://ipwho.is/${ip}`);
    if (a && a.success !== false) {
      provider = "ipwho.is";
      city = a.city;
      region = a.region_code;
      zip = a.postal;
      country = a.country_code;
    }

    // Provider B: ip-api.com — HTTP only on the free tier.
    if (!provider) {
      const b = await fetchJsonWithTimeout(
        `http://ip-api.com/json/${ip}?fields=status,city,regionCode,zip,countryCode&lang=en`,
      );
      if (b && b.status === "success") {
        provider = "ip-api.com";
        city = b.city;
        region = b.regionCode;
        zip = b.zip;
        country = b.countryCode;
      }
    }

    if (!provider) {
      console.log("[track-meta] geo: all providers failed — sending event without geo");
      return {};
    }

    const result: Record<string, string> = {};
    if (city) result.ct = await sha256hex(city);
    if (region) result.st = await sha256hex(region);
    if (zip) result.zp = await sha256hex(zip);
    if (country) result.country = await sha256hex(country);

    console.log("[track-meta] geo: resolved by", provider);
    GEO_CACHE.set(ip, { result, expiresAt: now + GEO_CACHE_TTL_MS });
    return result;
  } catch (e) {
    console.log("[track-meta] geo: unexpected failure, continuing without geo:", String(e));
    return {};
  }
}


const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ERA_MUSIC_LABEL_ID = "11111111-1111-4111-8111-111111111111";

interface LabelRow {
  id: string;
  name: string;
  pixel_id: string;
  capi_secret_name: string;
}

const LABEL_CACHE = new Map<string, LabelRow>();

async function getLabel(labelId: string | null): Promise<LabelRow | null> {
  const id = labelId && labelId.length > 0 ? labelId : ERA_MUSIC_LABEL_ID;
  const cached = LABEL_CACHE.get(id);
  if (cached) return cached;

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/labels?id=eq.${encodeURIComponent(id)}&select=id,name,pixel_id,capi_secret_name`,
      {
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
      },
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as LabelRow[];
    const row = rows?.[0] ?? null;
    if (row) LABEL_CACHE.set(id, row);
    return row;
  } catch {
    return null;
  }
}

/**
 * Percent-decode until stable so every parameter is encoded exactly once.
 * Mirrors the client-side normalisation, keeping browser and server
 * payloads byte-identical (fixes "Wav%2520Of%2520Luv").
 */
function normalizeParamValue(value: string): string {
  let current = value;
  for (let i = 0; i < 3; i++) {
    let decoded: string;
    try {
      decoded = decodeURIComponent(current);
    } catch {
      return current;
    }
    if (decoded === current) return current;
    current = decoded;
  }
  return current;
}

function normalizeCustomData(data: unknown): unknown {
  if (!data || typeof data !== "object") return data;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
    if (typeof v === "string") out[k] = normalizeParamValue(v);
    else if (Array.isArray(v)) {
      out[k] = v.map((item) => (typeof item === "string" ? normalizeParamValue(item) : item));
    } else out[k] = v;
  }
  return out;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const testEventCode = Deno.env.get("META_TEST_EVENTCODE");

    const body = await req.json();
    const {
      event_name,
      event_id,
      event_time,
      event_source_url,
      user_data,
      custom_data,
      label_id,
    } = body;

    // Resolve the Meta dataset from the release's label. Missing/unknown
    // label falls back to ERA Music.
    const label = await getLabel(typeof label_id === "string" ? label_id : null);
    const pixelId = label?.pixel_id ?? Deno.env.get("META_PIXEL_ID");
    const tokenSecretName = label?.capi_secret_name ?? "META_CAPIG_TOKEN";
    const accessToken = Deno.env.get(tokenSecretName) ?? Deno.env.get("META_CAPIG_TOKEN");

    // Log only WHETHER each required secret resolved — never its value.
    console.log("[track-meta] secrets:", {
      label_resolved: !!label,
      pixel_id_resolved: !!pixelId,
      token_secret_name: tokenSecretName,
      token_resolved: !!accessToken,
    });

    if (!pixelId || !accessToken) {
      console.error("[track-meta] Missing Meta credentials — event not sent");
      return new Response(
        JSON.stringify({ error: "Missing Meta credentials" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }


    // Input validation — prevent CAPI injection / attribution pollution
    const ALLOWED_EVENTS = new Set([
      "PageView",
      "ViewContent",
      "Lead",
      "Search",
      "AddToCart",
      "InitiateCheckout",
    ]);
    const ALLOWED_HOSTS = new Set([
      "link.eramusic.fr",
      "fanlinkhub.com",
      "www.fanlinkhub.com",
      "link-streammusic.lovable.app",
    ]);

    if (typeof event_name !== "string" || !ALLOWED_EVENTS.has(event_name)) {
      return new Response(
        JSON.stringify({ error: "Invalid event_name" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (typeof event_id !== "string" || event_id.length < 8 || event_id.length > 128) {
      return new Response(
        JSON.stringify({ error: "Invalid event_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const nowSec = Math.floor(Date.now() / 1000);
    if (
      typeof event_time !== "number" ||
      !Number.isFinite(event_time) ||
      Math.abs(nowSec - event_time) > 300
    ) {
      return new Response(
        JSON.stringify({ error: "Invalid event_time" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const ALLOWED_HOST_SUFFIXES = [".lovable.app", ".lovableproject.com"];
    try {
      const u = new URL(event_source_url);
      const okHost =
        ALLOWED_HOSTS.has(u.hostname) ||
        ALLOWED_HOST_SUFFIXES.some((s) => u.hostname.endsWith(s));
      if (!okHost) throw new Error("host not allowed");
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid event_source_url" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (user_data && typeof user_data !== "object") {
      return new Response(
        JSON.stringify({ error: "Invalid user_data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (custom_data && typeof custom_data !== "object") {
      return new Response(
        JSON.stringify({ error: "Invalid custom_data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const clientIp =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      null;

    console.log("[track-meta] Captured client IP:", clientIp,
      "| IPv6:", clientIp?.includes(":") ?? false);

    const enrichedUserData: Record<string, unknown> = { ...user_data };

    if (clientIp) {
      enrichedUserData.client_ip_address = clientIp;
      try {
        const geo = await getGeoForIp(clientIp);
        Object.assign(enrichedUserData, geo);
      } catch (geoErr) {
        console.log("[track-meta] geo: failed, event still sent:", String(geoErr));
      }
    }


    const customDataWithLabel =
      custom_data && typeof custom_data === "object" && label?.name
        ? { ...custom_data, label: label.name }
        : custom_data;

    const metaPayload: Record<string, unknown> = {
      data: [{
        event_name,
        event_id,
        event_time,
        event_source_url,
        action_source: "website",
        user_data: enrichedUserData,
        custom_data: normalizeCustomData(customDataWithLabel),
      }],
    };

    if (testEventCode) metaPayload.test_event_code = testEventCode;

    console.log("[track-meta] Sending to Meta:", { event_id, event_name });

    const metaRes = await fetch(
      `https://graph.facebook.com/${META_API_VERSION}/${pixelId}/events?access_token=${accessToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metaPayload),
      },
    );

    const rawBody = await metaRes.text();
    console.log("[track-meta] Meta response status:", metaRes.status);
    if (metaRes.status !== 200) {
      console.error("[track-meta] Meta response body:", rawBody);
    }

    let metaResult: unknown;
    try {
      metaResult = JSON.parse(rawBody);
    } catch {
      metaResult = { raw: rawBody };
    }

    return new Response(
      JSON.stringify({ success: metaRes.status === 200, event_id, meta: metaResult }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );

  } catch (error) {
    console.error("track-meta error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
