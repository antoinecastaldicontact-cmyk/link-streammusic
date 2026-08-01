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

const GEO_TIMEOUT_MS = 1500;

async function resolveCountryFromIp(ip: string): Promise<string | null> {
  const token = Deno.env.get("IPINFO_TOKEN");
  console.log("[visitor-country] secrets:", { IPINFO_TOKEN_resolved: !!token });

  // Provider A: ipinfo.io (HTTPS, IPv4/IPv6, plain ISO-2 text). Needs a token.
  if (token) {
    try {
      const res = await fetch(
        `https://ipinfo.io/${ip}/country?token=${token}`,
        { signal: AbortSignal.timeout(GEO_TIMEOUT_MS) },
      );
      if (res.ok) {
        const code = normalizeIso2(await res.text());
        if (code) {
          console.log("[visitor-country] resolved by ipinfo.io");
          return code;
        }
      } else {
        await res.body?.cancel();
        console.log("[visitor-country] ipinfo.io HTTP", res.status);
      }
    } catch (e) {
      console.log("[visitor-country] ipinfo.io failed:", String(e));
    }
  }

  // Provider B: ipwho.is (HTTPS, keyless, IPv4/IPv6).
  try {
    const res = await fetch(`https://ipwho.is/${ip}`, {
      signal: AbortSignal.timeout(GEO_TIMEOUT_MS),
    });
    if (res.ok) {
      const data = await res.json();
      const code =
        normalizeIso2(data?.country_code) ||
        normalizeIso2(data?.countryCode) ||
        normalizeIso2(data?.country);
      if (code) {
        console.log("[visitor-country] resolved by ipwho.is");
        return code;
      }
      console.log("[visitor-country] ipwho.is returned no usable country");
    } else {
      await res.body?.cancel();
      console.log("[visitor-country] ipwho.is HTTP", res.status);
    }
  } catch (e) {
    console.log("[visitor-country] ipwho.is failed:", String(e));
  }

  // Provider C: ip-api.com (HTTP only on the free tier, keyless).
  try {
    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,countryCode`,
      { signal: AbortSignal.timeout(GEO_TIMEOUT_MS) },
    );
    if (res.ok) {
      const data = await res.json();
      const code = data?.status === "success" ? normalizeIso2(data?.countryCode) : null;
      if (code) {
        console.log("[visitor-country] resolved by ip-api.com");
        return code;
      }
    } else {
      await res.body?.cancel();
      console.log("[visitor-country] ip-api.com HTTP", res.status);
    }
  } catch (e) {
    console.log("[visitor-country] ip-api.com failed:", String(e));
  }

  console.log("[visitor-country] all providers failed");
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
