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

function normalizeIso2(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const code = value.trim().toUpperCase();
  if (code.length !== 2 || code === "XX" || !/^[A-Z]{2}$/.test(code)) return null;
  return code;
}

async function resolveCountryFromIp(ip: string): Promise<string | null> {
  const token = Deno.env.get("IPINFO_TOKEN");

  // Provider A: ipinfo.io (HTTPS, supports IPv4/IPv6, returns plain ISO-2 text).
  if (token) {
    try {
      const res = await fetch(
        `https://ipinfo.io/${ip}/country?token=${token}`,
        { signal: AbortSignal.timeout(2000) },
      );
      if (res.ok) {
        const text = await res.text();
        const code = normalizeIso2(text);
        if (code) return code;
      } else {
        await res.body?.cancel();
      }
    } catch {
      // fall through to keyless provider
    }
  }

  // Provider B: ipwho.is (HTTPS, keyless, supports IPv4/IPv6).
  try {
    const res = await fetch(
      `https://ipwho.is/${ip}`,
      { signal: AbortSignal.timeout(2000) },
    );
    if (res.ok) {
      const data = await res.json();
      const code =
        normalizeIso2(data?.country_code) ||
        normalizeIso2(data?.countryCode) ||
        normalizeIso2(data?.country);
      if (code) return code;
    } else {
      await res.body?.cancel();
    }
  } catch {
    // give up
  }

  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // 1) Try cf-ipcountry first (free when populated by Cloudflare-fronted infra).
  let country = normalizeIso2(req.headers.get("cf-ipcountry"));

  // 2/3) Fallback: resolve via HTTPS provider from the client IP.
  if (!country) {
    const ip = extractClientIp(req);
    if (ip) {
      country = await resolveCountryFromIp(ip);
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
