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

/**
 * Detect device type from user agent and touch capability.
 * Returns: "mobile" | "tablet" | "desktop"
 */
export function getDeviceType(): "mobile" | "tablet" | "desktop" {
  const ua = navigator.userAgent;
  if (/iPad|Android(?!.*Mobile)|Tablet/i.test(ua)) return "tablet";
  if (/Mobi|iPhone|iPod|Android.*Mobile|Windows Phone/i.test(ua)) return "mobile";
  return "desktop";
}

/**
 * Detect OS from user agent.
 * Returns: "iOS" | "Android" | "macOS" | "Windows" | "Linux" | "Other"
 */
export function getOS(): string {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return "iOS";
  if (/Android/.test(ua)) return "Android";
  if (/Mac OS X|Macintosh/.test(ua)) return "macOS";
  if (/Windows/.test(ua)) return "Windows";
  if (/Linux/.test(ua)) return "Linux";
  return "Other";
}

/**
 * Detect browser from user agent. In-app browsers (Instagram, TikTok, etc.)
 * are detected separately by getInAppBrowser() — this returns the underlying
 * engine (Chrome, Safari, etc.).
 * Returns: "Chrome" | "Safari" | "Firefox" | "Edge" | "Opera" | "Other"
 */
export function getBrowser(): string {
  const ua = navigator.userAgent;
  // Order matters: Edge before Chrome, Chrome before Safari (Edge/Chrome
  // include Safari token, Chrome includes Safari token).
  if (/Edg\//.test(ua)) return "Edge";
  if (/OPR\/|Opera/.test(ua)) return "Opera";
  if (/Firefox/.test(ua)) return "Firefox";
  if (/Chrome/.test(ua)) return "Chrome";
  if (/Safari/.test(ua)) return "Safari";
  return "Other";
}

/**
 * Detect in-app browser (webview) used by social apps. This is critical for
 * ERA — clicks from Instagram/TikTok ads land in their in-app browser, which
 * does NOT share cookies with the user's installed Spotify/Apple Music app.
 * Conversion friction is much higher in these contexts.
 *
 * Returns the app name when detected, otherwise null.
 */
export function getInAppBrowser(): string | null {
  const ua = navigator.userAgent;
  if (/Instagram/i.test(ua)) return "instagram";
  if (/TikTok|musical_ly|BytedanceWebview/i.test(ua)) return "tiktok";
  if (/Snapchat/i.test(ua)) return "snapchat";
  if (/FBAN|FBAV|FB_IAB|FB4A/i.test(ua)) return "facebook";
  if (/Twitter/i.test(ua)) return "twitter";
  if (/LinkedInApp/i.test(ua)) return "linkedin";
  if (/Line\//i.test(ua)) return "line";
  return null;
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
  // Device enrichment
  device_type?: string;
  os?: string;
  browser?: string;
  in_app_browser?: string;
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

  // Auto-enrich with device data on every event. Caller-supplied values in
  // customData take precedence (rare but allowed).
  const inAppBrowser = getInAppBrowser();
  const enrichedData: Record<string, string | string[] | boolean> = {
    content_type: "music",
    device_type: getDeviceType(),
    os: getOS(),
    browser: getBrowser(),
    ...(inAppBrowser ? { in_app_browser: inAppBrowser } : {}),
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
      // Device-level signals to lift EMQ
      screen_resolution: `${screen.width}x${screen.height}`,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`,
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
