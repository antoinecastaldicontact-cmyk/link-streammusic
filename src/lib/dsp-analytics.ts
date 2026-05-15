import { supabase } from "@/integrations/supabase/client";
import { getExternalId } from "@/lib/tracking";

export interface DspEventMetadata {
  release_slug?: string;
  artist_name?: string;
  release_type?: string;
  genre_primary?: string;
  label?: string;
  is_new_release?: boolean;
  mood_tags?: string[];
  track_language?: string;
  event_id?: string;
}

export async function trackDspEvent(
  eventType: "view" | "click",
  dspName?: string,
  metadata: DspEventMetadata = {},
) {
  try {
    await supabase.from("dsp_events").insert({
      event_type: eventType,
      dsp_name: dspName ?? null,
      page_path: window.location.pathname,
      external_id: getExternalId(),
      user_agent: navigator.userAgent,
      event_id: metadata.event_id ?? null,
      release_slug: metadata.release_slug ?? null,
      artist_name: metadata.artist_name ?? null,
      release_type: metadata.release_type ?? null,
      genre_primary: metadata.genre_primary ?? null,
      label: metadata.label ?? null,
      is_new_release: metadata.is_new_release ?? null,
      mood_tags: metadata.mood_tags ?? null,
      track_language: metadata.track_language ?? null,
    });
  } catch (e) {
    console.error("DSP analytics error:", e);
  }
}
