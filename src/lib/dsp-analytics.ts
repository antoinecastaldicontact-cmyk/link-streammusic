import { supabase } from "@/integrations/supabase/client";

function getExternalId(): string {
  let id = localStorage.getItem("era_eid");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("era_eid", id);
  }
  return id;
}

export async function trackDspEvent(
  eventType: "view" | "click",
  dspName?: string,
) {
  try {
    await supabase.from("dsp_events").insert({
      event_type: eventType,
      dsp_name: dspName ?? null,
      page_path: window.location.pathname,
      external_id: getExternalId(),
      user_agent: navigator.userAgent,
    });
  } catch (e) {
    console.error("DSP analytics error:", e);
  }
}
