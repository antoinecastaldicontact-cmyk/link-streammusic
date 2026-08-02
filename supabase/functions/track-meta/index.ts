import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const META_API_VERSION = "v18.0";
const TOKEN_SECRET_NAME = "META_CAPIG_TOKEN";
const PIXEL_SECRET_NAME = "META_PIXEL_ID";

// Hard budget for the WHOLE geo enrichment step (all providers combined).
const GEO_TOTAL_BUDGET_MS = 800;

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
const GEO_CACHE = new Map<string, { result: Record<string, string>; expiresAt: number }>();
const GEO_CACHE_TTL_MS = 15 * 60 * 1000;

/**
 * HTTPS-only geo lookup. ip-api.com (plain HTTP) has been removed: outbound
 * HTTP can hang or be blocked in the Edge runtime.
 * The caller enforces the global 800 ms budget; this function also respects
 * the shared AbortSignal so no provider can outlive it.
 */
async function fetchGeo(ip: string, signal: AbortSignal): Promise<Record<string, string>> {
  const result: Record<string, string> = {};

  // Provider A: ipinfo.io (token optional)
  const token = Deno.env.get("IPINFO_TOKEN");
  if (token) {
    try {
      const res = await fetch(
        `https://ipinfo.io/${ip}/json?token=${token}`,
        { signal },
      );
      if (res.ok) {
        const geo = await res.json();
        if (geo.city) result.ct = await sha256hex(geo.city);
        if (geo.region) result.st = await sha256hex(geo.region);
        if (geo.postal) result.zp = await sha256hex(geo.postal);
        if (geo.country) result.country = await sha256hex(geo.country);
        if (Object.keys(result).length > 0) return result;
      } else {
        await res.body?.cancel();
      }
    } catch (e) {
      console.warn("[track-meta] geo provider ipinfo failed:", String(e));
    }
  }

  // Provider B: ipwho.is (HTTPS, keyless)
  try {
    const res = await fetch(`https://ipwho.is/${ip}`, { signal });
    if (res.ok) {
      const geo = await res.json();
      if (geo.city) result.ct = await sha256hex(geo.city);
      if (geo.region_code || geo.region) {
        result.st = await sha256hex(geo.region_code || geo.region);
      }
      if (geo.postal) result.zp = await sha256hex(geo.postal);
      if (geo.country_code) result.country = await sha256hex(geo.country_code);
    } else {
      await res.body?.cancel();
    }
  } catch (e) {
    console.warn("[track-meta] geo provider ipwho failed:", String(e));
  }

  return result;
}

/**
 * Never throws, never exceeds GEO_TOTAL_BUDGET_MS. Returns {} on any problem.
 */
async function getGeoForIp(ip: string): Promise<Record<string, string>> {
  const now = Date.now();
  const cached = GEO_CACHE.get(ip);
  if (cached && cached.expiresAt > now) return cached.result;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GEO_TOTAL_BUDGET_MS);

  try {
    const result = await Promise.race([
      fetchGeo(ip, controller.signal),
      new Promise<Record<string, string>>((resolve) =>
        setTimeout(() => resolve({}), GEO_TOTAL_BUDGET_MS)
      ),
    ]);
    if (Object.keys(result).length > 0) {
      GEO_CACHE.set(ip, { result, expiresAt: now + GEO_CACHE_TTL_MS });
    }
    return result;
  } catch (e) {
    console.warn("[track-meta] geo step abandoned:", String(e));
    return {};
  } finally {
    clearTimeout(timer);
    controller.abort();
  }
}

interface LabelRow {
  name: string;
  slug_prefix: string;
  pixel_id: string;
  capi_secret_name: string;
}

let LABELS_CACHE: { rows: LabelRow[]; expiresAt: number } | null = null;

async function getLabels(): Promise<LabelRow[]> {
  const now = Date.now();
  if (LABELS_CACHE && LABELS_CACHE.expiresAt > now) return LABELS_CACHE.rows;

  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return [];

  try {
    const res = await fetch(
      `${url}/rest/v1/labels?select=name,slug_prefix,pixel_id,capi_secret_name`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        signal: AbortSignal.timeout(3000),
      },
    );
    if (!res.ok) {
      await res.body?.cancel();
      return [];
    }
    const rows = (await res.json()) as LabelRow[];
    LABELS_CACHE = { rows, expiresAt: now + 5 * 60 * 1000 };
    return rows;
  } catch (e) {
    console.warn("[track-meta] labels lookup failed:", String(e));
    return [];
  }
}

/** Resolve the label from the first path segment of the event source URL. */
async function resolveLabelByUrl(eventSourceUrl: string): Promise<LabelRow | null> {
  let prefix = "";
  try {
    const segments = new URL(eventSourceUrl).pathname.split("/").filter(Boolean);
    if (segments.length > 1) prefix = segments[0].toLowerCase();
  } catch {
    return null;
  }
  const labels = await getLabels();
  return labels.find((l) => (l.slug_prefix ?? "").toLowerCase() === prefix) ?? null;
}

async function resolveLabelByName(name: string): Promise<LabelRow | null> {
  const labels = await getLabels();
  return labels.find((l) => l.name === name) ?? null;
}

async function runSelfTest(labelName: string | null): Promise<Response> {
  const label = labelName ? await resolveLabelByName(labelName) : null;

  const pixelSecretName = label ? "labels.pixel_id" : PIXEL_SECRET_NAME;
  const tokenSecretName = label ? label.capi_secret_name : TOKEN_SECRET_NAME;
  const pixelId = label ? label.pixel_id : (Deno.env.get(PIXEL_SECRET_NAME) ?? null);
  const token = Deno.env.get(tokenSecretName) ?? null;

  const out: Record<string, unknown> = {
    selftest: true,
    deployed_at_runtime: new Date().toISOString(),
    label_requested: labelName,
    label_row_resolved: labelName ? Boolean(label) : Boolean(pixelId),
    label_name: label?.name ?? null,
    pixel_id: pixelId,
    pixel_secret_name: pixelSecretName,
    token_secret_name: tokenSecretName,
    token_resolved: Boolean(token),
  };

  if (pixelId && token) {
    try {
      const res = await fetch(
        `https://graph.facebook.com/${META_API_VERSION}/${pixelId}?access_token=${token}`,
        { signal: AbortSignal.timeout(8000) },
      );
      out.validation_status = res.status;
      out.validation_body = await res.text();
    } catch (e) {
      out.validation_status = null;
      out.validation_error = String(e);
    }
  } else {
    out.validation_skipped = "missing pixel_id or token";
  }

  console.log("[track-meta][selftest]", JSON.stringify({
    ...out,
    validation_body: undefined,
  }));

  return new Response(JSON.stringify(out, null, 2), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    const url = new URL(req.url);
    if (url.searchParams.get("selftest") === "1") {
      return await runSelfTest(url.searchParams.get("label"));
    }

    let pixelId = Deno.env.get(PIXEL_SECRET_NAME);
    let accessToken = Deno.env.get(TOKEN_SECRET_NAME);
    const testEventCode = Deno.env.get("META_TEST_EVENTCODE");

    console.log("[track-meta] invoked", JSON.stringify({
      method: req.method,
      pixel_resolved: Boolean(pixelId),
      token_resolved: Boolean(accessToken),
    }));

    if (!pixelId || !accessToken) {
      console.error("[track-meta] Missing Meta credentials", {
        pixel_secret: PIXEL_SECRET_NAME,
        token_secret: TOKEN_SECRET_NAME,
      });
      return new Response(
        JSON.stringify({ error: "Missing Meta credentials" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json();
    const { event_name, event_id, event_time, event_source_url, user_data, custom_data } = body;

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

    const enrichedUserData: Record<string, unknown> = { ...user_data };

    if (clientIp) {
      // Raw IP is always sent, independent of geo success.
      enrichedUserData.client_ip_address = clientIp;
      const geoStart = Date.now();
      let geo: Record<string, string> = {};
      try {
        geo = await getGeoForIp(clientIp);
      } catch (e) {
        console.warn("[track-meta] geo threw, continuing without it:", String(e));
      }
      console.log("[track-meta] geo step", JSON.stringify({
        event_id,
        ms: Date.now() - geoStart,
        fields: Object.keys(geo).length,
      }));
      Object.assign(enrichedUserData, geo);
    }

    const metaPayload: Record<string, unknown> = {
      data: [{
        event_name,
        event_id,
        event_time,
        event_source_url,
        action_source: "website",
        user_data: enrichedUserData,
        custom_data,
      }],
    };

    if (testEventCode) metaPayload.test_event_code = testEventCode;

    console.log("[track-meta] sending to Meta", JSON.stringify({
      event_id,
      event_name,
      pixel_id: pixelId,
    }));

    let metaStatus: number | null = null;
    let metaBodyText = "";
    try {
      const metaRes = await fetch(
        `https://graph.facebook.com/${META_API_VERSION}/${pixelId}/events?access_token=${accessToken}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(metaPayload),
          signal: AbortSignal.timeout(10000),
        },
      );
      metaStatus = metaRes.status;
      metaBodyText = await metaRes.text();
    } catch (e) {
      console.error("[track-meta] Meta fetch failed", JSON.stringify({
        event_id,
        pixel_id: pixelId,
        error: String(e),
        stack: e instanceof Error ? e.stack : undefined,
      }));
      return new Response(
        JSON.stringify({ success: false, event_id, error: "Meta request failed" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (metaStatus === 200) {
      console.log("[track-meta] Meta response", JSON.stringify({
        event_id,
        pixel_id: pixelId,
        status: metaStatus,
      }));
    } else {
      console.error("[track-meta] Meta non-200", JSON.stringify({
        event_id,
        pixel_id: pixelId,
        status: metaStatus,
        body: metaBodyText,
      }));
    }

    let metaResult: unknown = metaBodyText;
    try {
      metaResult = JSON.parse(metaBodyText);
    } catch {
      // keep raw text
    }

    return new Response(
      JSON.stringify({ success: metaStatus === 200, event_id, status: metaStatus, meta: metaResult }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("[track-meta] unhandled error", JSON.stringify({
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined,
    }));
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
