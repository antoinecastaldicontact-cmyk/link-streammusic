const CAPIG_URL = import.meta.env.VITE_CAPIG_URL ?? "https://capig.stape.at/event";
const CAPIG_KEY = import.meta.env.VITE_CAPIG_KEY ?? "hchswlqp";

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
  enabled: boolean = true
) {
  if (!enabled) return;
  const eventId = crypto.randomUUID();

  if (typeof window !== "undefined" && (window as any).fbq) {
    (window as any).fbq("track", eventName, customData, { eventID: eventId });
  }

  const event = {
    event_name: eventName,
    event_id: eventId,
    event_time: Math.floor(Date.now() / 1000),
    event_source_url: window.location.href,
    action_source: "website",
    user_data: {
      client_user_agent: navigator.userAgent,
      fbp: getCookie("_fbp"),
      fbc: getFbc(),
      external_id: getExternalId(),
    },
    custom_data: customData,
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
