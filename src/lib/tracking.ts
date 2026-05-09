const FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_URL + "/functions/v1/track-meta";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const FINGERPRINT_CACHE_KEY = "era_fp_v2";
const LEGACY_EID_KEY = "era_eid";

export function getCookie(name: string): string | null {
  const v = document.cookie.match("(^|;) ?" + name + "=([^;]*)(;|$)");
  return v ? v[2] : null;
}

export function getFbc(): string | null {
  const fbclid = new URLSearchParams(window.location.search).get("fbclid");
  if (fbclid) {
    const fbc = `fb.1.${Date.now()}.${fbclid}`;
    document.cookie = `_fbc=${fbc};max-age=7776000;path=/`;
    return fbc;
  }
  return getCookie("_fbc");
}

function buildFingerprintInput(): string {
  const nav = navigator;
  const components = [
    nav.userAgent,
    `${screen.width}x${screen.height}x${screen.colorDepth}`,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    nav.language,
    (nav as Navigator & { platform?: string }).platform ?? "",
    `${nav.hardwareConcurrency ?? 0}`,
    `${nav.maxTouchPoints ?? 0}`,
    `${(nav as Navigator & { deviceMemory?: number }).deviceMemory ?? 0}`,
  ];
  return components.join("|");
}

export async function getStableFingerprint(): Promise<string> {
  const cached = localStorage.getItem(FINGERPRINT_CACHE_KEY);
  if (cached) return cached;

  const input = buildFingerprintInput();
  const buf = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", buf);
  const hex = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  localStorage.setItem(FINGERPRINT_CACHE_KEY, hex);
  localStorage.removeItem(LEGACY_EID_KEY);
  return hex;
}

export function getExternalId(): string {
  return localStorage.getItem(FINGERPRINT_CACHE_KEY) ?? "";
}

export interface TrackEventData {
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  genre_primary?: string;
  genre_secondary?: string;
  artist_name?: string;
  label?: string;
  release_type?: string;
  release_slug?: string;
  dsp_chosen?: string;
  is_new_release?: boolean;
  mood_tags?: string[];
  track_language?: string;
  [key: string]: string | string[] | boolean | undefined;
}

export interface TrackEventOptions {
  consent?: boolean;
  eventId?: string;
}

export async function trackEvent(
  eventName: string,
  customData: TrackEventData = {},
  options: TrackEventOptions | boolean = {},
): Promise<string> {
  const opts: TrackEventOptions =
    typeof options === "boolean" ? { consent: options } : options;
  const consent = opts.consent ?? true;
  const eventId = opts.eventId ?? crypto.randomUUID();

  const enrichedData: Record<string, string | string[] | boolean> = {
    content_type: "music",
  };
  for (const [k, v] of Object.entries(customData)) {
    if (v !== undefined && v !== null && v !== "") {
      enrichedData[k] = v;
    }
  }

  // Browser pixel — consent-gated, kept for real-time attribution
  if (consent && typeof window !== "undefined" && (window as { fbq?: unknown }).fbq) {
    (window as unknown as { fbq: (...args: unknown[]) => void }).fbq(
      "track",
      eventName,
      enrichedData,
      { eventID: eventId },
    );
  }

  // Server-side via Supabase Edge Function → Meta CAPI direct
  const fingerprint = await getStableFingerprint();

  const payload = {
    event_name: eventName,
    event_id: eventId,
    event_time: Math.floor(Date.now() / 1000),
    event_source_url: window.location.href,
    user_data: {
      client_user_agent: navigator.userAgent,
      external_id: fingerprint,
      ...(consent ? { fbp: getCookie("_fbp"), fbc: getFbc() } : {}),
    },
    custom_data: enrichedData,
  };

  try {
    await fetch(FUNCTIONS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "apikey": SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error("Edge Function tracking error:", e);
  }

  return eventId;
}
