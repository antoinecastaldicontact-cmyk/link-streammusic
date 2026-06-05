import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function extractClientIp(req: Request): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0].trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip") || req.headers.get("cf-connecting-ip");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Try cf-ipcountry first (works on Cloudflare-fronted infra, free if present).
  let country = req.headers.get("cf-ipcountry");

  // Fallback: resolve via ip-api.com from the client IP.
  if (!country || country === "XX") {
    const ip = extractClientIp(req);
    if (ip) {
      try {
        const res = await fetch(
          `https://ip-api.com/json/${ip}?fields=countryCode`,
          { signal: AbortSignal.timeout(1500) },
        );
        if (res.ok) {
          const data = await res.json();
          if (data.countryCode) country = data.countryCode;
        }
      } catch {
        // Network failure or timeout — fall through to XX.
      }
    }
  }

  return new Response(
    JSON.stringify({ country: country || "XX" }),
    {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        // Short cache — IP may change between sessions but is stable
        // within one visit window. 1 hour is a reasonable compromise.
        "Cache-Control": "public, max-age=3600",
      },
    },
  );
});
