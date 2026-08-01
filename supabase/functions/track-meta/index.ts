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
// 15 min before Deno recycles it). Reduces ip-api calls by 5-10x.
const GEO_CACHE = new Map<string, { result: Record<string, string>; expiresAt: number }>();

const GEO_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

async function getGeoForIp(ip: string): Promise<Record<string, string>> {
  const now = Date.now();

  const cached = GEO_CACHE.get(ip);
  if (cached && cached.expiresAt > now) {
    return cached.result;
  }

  try {
    const geoRes = await fetch(
      `https://ip-api.com/json/${ip}?fields=city,regionCode,zip,countryCode&lang=en`,
      { signal: AbortSignal.timeout(1500) },
    );
    if (!geoRes.ok) return {};

    const geo = await geoRes.json();
    const result: Record<string, string> = {};
    if (geo.city) result.ct = await sha256hex(geo.city);
    if (geo.regionCode) result.st = await sha256hex(geo.regionCode);
    if (geo.zip) result.zp = await sha256hex(geo.zip);
    if (geo.countryCode) result.country = await sha256hex(geo.countryCode);

    GEO_CACHE.set(ip, { result, expiresAt: now + GEO_CACHE_TTL_MS });
    return result;
  } catch {
    return {};
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const pixelId = Deno.env.get("META_PIXEL_ID");
    const accessToken = Deno.env.get("META_CAPIG_TOKEN");
    const testEventCode = Deno.env.get("META_TEST_EVENTCODE");

    if (!pixelId || !accessToken) {
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

    console.log("[track-meta] Captured client IP:", clientIp,
      "| IPv6:", clientIp?.includes(":") ?? false);

    const enrichedUserData: Record<string, unknown> = { ...user_data };

    if (clientIp) {
      enrichedUserData.client_ip_address = clientIp;
      const geo = await getGeoForIp(clientIp);
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

    const metaRes = await fetch(
      `https://graph.facebook.com/${META_API_VERSION}/${pixelId}/events?access_token=${accessToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metaPayload),
      },
    );

    const metaResult = await metaRes.json();

    return new Response(
      JSON.stringify({ success: true, event_id, meta: metaResult }),
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
