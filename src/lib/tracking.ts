const CAPIG_URL = import.meta.env.VITE_CAPIG_URL ?? "https://capig.stape.at/event";
const CAPIG_KEY = import.meta.env.VITE_CAPIG_KEY ?? "eyJpIjoiaGNoc3dscXAiLCJoIjoiY2FwaWcuc3RhcGUuYXQiLCJrIjoiYTQ0ZjBjNjU3YTJjNzEyN2RmYmJjN2M4NGM4YTQ1NjA3ODExNTE5NmhjaHN3bHFwIn0=";

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

export function getExternalId(): string {
  let id = localStorage.getItem("era_eid");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("era_eid", id);
  }
  return id;
}

export async function trackEvent(
  eventName: string,
  customData: Record<string, string> = {},
  consent: boolean = true
) {
  const eventId = crypto.randomUUID();
  const enrichedData = { ...customData, content_type: "music" };

  // Browser pixel — ALWAYS fires (important for Meta campaigns)
  if (typeof window !== "undefined" && (window as any).fbq) {
    (window as any).fbq("track", eventName, enrichedData, { eventID: eventId });
  }

  // CAPIG server-side — ALWAYS fires
  const event = {
    event_name: eventName,
    event_id: eventId,
    event_time: Math.floor(Date.now() / 1000),
    event_source_url: window.location.href,
    action_source: "website",
    user_data: {
      client_user_agent: navigator.userAgent,
      ...(consent ? { fbp: getCookie("_fbp"), fbc: getFbc() } : {}),
      external_id: getExternalId(),
    },
    custom_data: enrichedData,
  };

  try {
    await fetch(CAPIG_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "capig-api-key": CAPIG_KEY,
      },
      body: JSON.stringify({ data: [event] }),
    });
  } catch (e) {
    console.error("CAPIG error:", e);
  }
}
