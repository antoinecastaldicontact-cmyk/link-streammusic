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

    const clientIp =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      req.headers.get("x-client-ip") ||
      null;

    console.log("[track-meta] Captured client IP:", clientIp,
      "| IPv6:", clientIp?.includes(":") ?? false);

    const enrichedUserData: Record<string, unknown> = { ...user_data };

    if (clientIp) {
      enrichedUserData.client_ip_address = clientIp;

      try {
        const geoRes = await fetch(
          `http://ip-api.com/json/${clientIp}?fields=city,regionCode,zip,countryCode&lang=en`,
          { signal: AbortSignal.timeout(1500) },
        );
        if (geoRes.ok) {
          const geo = await geoRes.json();
          if (geo.city) enrichedUserData.ct = await sha256hex(geo.city);
          if (geo.regionCode) enrichedUserData.st = await sha256hex(geo.regionCode);
          if (geo.zip) enrichedUserData.zp = await sha256hex(geo.zip);
          if (geo.countryCode) enrichedUserData.country = await sha256hex(geo.countryCode);
        }
      } catch {
        // Geo best-effort — never block event on geo API error
      }
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
