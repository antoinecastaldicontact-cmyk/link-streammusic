import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      email,
      release_slug,
      artist_name,
      genre_primary,
      mood_tags,
      track_language,
      in_app_browser,
      source_url,
    } = body;

    if (!email || !isValidEmail(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const hashedEmail = await sha256hex(normalizedEmail);

    const clientIp =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      null;

    let country: string | null = null;
    let hashedCountry: string | null = null;
    let hashedCity: string | null = null;
    let hashedState: string | null = null;
    let hashedZip: string | null = null;
    if (clientIp) {
      try {
        const geoRes = await fetch(
          `https://ip-api.com/json/${clientIp}?fields=city,regionCode,zip,countryCode&lang=en`,
          { signal: AbortSignal.timeout(1500) },
        );
        if (geoRes.ok) {
          const geo = await geoRes.json();
          if (geo.countryCode) {
            country = geo.countryCode;
            hashedCountry = await sha256hex(geo.countryCode);
          }
          if (geo.city) hashedCity = await sha256hex(geo.city);
          if (geo.regionCode) hashedState = await sha256hex(geo.regionCode);
          if (geo.zip) hashedZip = await sha256hex(geo.zip);
        }
      } catch {
        // ignore
      }
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: dbError } = await supabase
      .from("email_subscribers")
      .upsert({
        email: normalizedEmail,
        hashed_email: hashedEmail,
        release_slug: release_slug ?? null,
        artist_name: artist_name ?? null,
        genre_primary: genre_primary ?? null,
        mood_tags: mood_tags ?? null,
        track_language: track_language ?? null,
        in_app_browser: in_app_browser ?? null,
        country: country,
        source_url: source_url ?? null,
      }, { onConflict: "email" });

    if (dbError) {
      console.error("[subscribe] Supabase insert error:", dbError);
    }

    const beehiivKey = Deno.env.get("BEEHIIV_API_KEY");
    const beehiivPubId = Deno.env.get("BEEHIIV_PUBLICATION_ID");
    let beehiivSynced = false;
    if (beehiivKey && beehiivPubId) {
      try {
        const beehiivRes = await fetch(
          `https://api.beehiiv.com/v2/publications/${beehiivPubId}/subscriptions`,
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${beehiivKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: normalizedEmail,
              reactivate_existing: true,
              send_welcome_email: true,
              utm_source: "fanlinkhub",
              utm_medium: "newsletter_widget",
              utm_campaign: release_slug ?? "unknown",
              referring_site: source_url ?? "https://fanlinkhub.com",
              custom_fields: [
                { name: "release_slug", value: release_slug ?? "" },
                { name: "artist_name", value: artist_name ?? "" },
                { name: "genre_primary", value: genre_primary ?? "" },
              ],
            }),
            signal: AbortSignal.timeout(3000),
          },
        );
        if (beehiivRes.ok) {
          const beehiivData = await beehiivRes.json();
          beehiivSynced = true;
          await supabase
            .from("email_subscribers")
            .update({
              beehiiv_synced: true,
              beehiiv_subscriber_id: beehiivData.data?.id ?? null,
            })
            .eq("email", normalizedEmail);
        } else {
          console.error("[subscribe] Beehiiv error:", await beehiivRes.text());
        }
      } catch (e) {
        console.error("[subscribe] Beehiiv fetch error:", e);
      }
    }

    const pixelId = Deno.env.get("META_PIXEL_ID");
    const accessToken = Deno.env.get("META_CAPIG_TOKEN");
    const testEventCode = Deno.env.get("META_TEST_EVENTCODE");

    if (pixelId && accessToken) {
      const userData: Record<string, unknown> = {
        em: [hashedEmail],
        client_user_agent: req.headers.get("user-agent") ?? "",
      };
      if (clientIp) userData.client_ip_address = clientIp;
      if (hashedCountry) userData.country = hashedCountry;
      if (hashedCity) userData.ct = hashedCity;
      if (hashedState) userData.st = hashedState;
      if (hashedZip) userData.zp = hashedZip;

      const customData: Record<string, unknown> = {
        content_type: "newsletter",
      };
      if (release_slug) customData.release_slug = release_slug;
      if (artist_name) customData.artist_name = artist_name;
      if (genre_primary) customData.genre_primary = genre_primary;
      if (mood_tags) customData.mood_tags = mood_tags;
      if (track_language) customData.track_language = track_language;
      if (in_app_browser) customData.in_app_browser = in_app_browser;

      const metaPayload: Record<string, unknown> = {
        data: [{
          event_name: "Subscribe",
          event_id: crypto.randomUUID(),
          event_time: Math.floor(Date.now() / 1000),
          event_source_url: source_url ?? "https://fanlinkhub.com",
          action_source: "website",
          user_data: userData,
          custom_data: customData,
        }],
      };

      if (testEventCode) metaPayload.test_event_code = testEventCode;

      try {
        await fetch(
          `https://graph.facebook.com/${META_API_VERSION}/${pixelId}/events?access_token=${accessToken}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(metaPayload),
          },
        );
      } catch (e) {
        console.error("[subscribe] Meta CAPI error:", e);
      }
    }

    return new Response(
      JSON.stringify({ success: true, beehiiv_synced: beehiivSynced }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("[subscribe] error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
