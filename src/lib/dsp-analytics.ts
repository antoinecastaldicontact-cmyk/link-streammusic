import { supabase } from "@/integrations/supabase/client";
import { getExternalId } from "@/lib/tracking";

/**
 * Internal Supabase logging for fan-link views and DSP clicks.
 *
 * V2 — Logs the same enriched metadata we send to Meta and shares the
 * `event_id` with the Meta payload, so we can later reconcile Stape CAPIG
 * deliveries with our own first-party records (and audit Meta's reported
 * conversion counts).
 */

export interface DspEventMetadata {
  release_slug?: string;
  artist_name?: string;
  release_type?: string;
  genre_primary?: string;
  genre_secondary?: string;
  label?: string;
  is_new_release?: boolean;
  mood_tags?: string[];
  track_language?: string;
  /** Shared with the Meta event for cross-system reconciliation. */
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
      // V2 enriched fields — all nullable on the table side
      event_id: metadata.event_id ?? null,
      release_slug: metadata.release_slug ?? null,
      artist_name: metadata.artist_name ?? null,
      release_type: metadata.release_type ?? null,
      genre_primary: metadata.genre_primary ?? null,
      genre_secondary: metadata.genre_secondary ?? null,
      label: metadata.label ?? null,
      is_new_release: metadata.is_new_release ?? null,
      mood_tags: metadata.mood_tags ?? null,
      track_language: metadata.track_language ?? null,
    });
  } catch (e) {
    console.error("DSP analytics error:", e);
  }
}
