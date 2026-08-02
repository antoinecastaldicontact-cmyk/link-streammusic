import { supabase } from "@/integrations/supabase/client";

/**
 * Public label shape. The client MUST only ever read these columns —
 * capi_secret_name is server-side only and never exposed to the browser.
 */
export interface PublicLabel {
  id: string;
  name: string;
  slug_prefix: string;
  pixel_id: string;
}

/** ERA Music — default dataset used when a release has no labelId. */
export const DEFAULT_PIXEL_ID = "1272936565032247";

let labelsPromise: Promise<PublicLabel[]> | null = null;

export function fetchLabels(): Promise<PublicLabel[]> {
  if (!labelsPromise) {
    labelsPromise = supabase
      .from("labels")
      .select("id,name,slug_prefix,pixel_id")
      .then(({ data, error }) => {
        if (error) {
          labelsPromise = null;
          console.error("labels fetch error:", error.message);
          return [];
        }
        return (data ?? []) as PublicLabel[];
      });
  }
  return labelsPromise;
}

export async function resolvePixelId(labelId?: string): Promise<string> {
  if (!labelId) return DEFAULT_PIXEL_ID;
  try {
    const labels = await fetchLabels();
    const match = labels.find((l) => l.id === labelId);
    return match?.pixel_id || DEFAULT_PIXEL_ID;
  } catch {
    return DEFAULT_PIXEL_ID;
  }
}

let initializedPixelId: string | null = null;

/** Initialise exactly one Meta pixel per page (idempotent). */
export function initPixel(pixelId: string) {
  if (initializedPixelId) return;
  const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
  if (!fbq) return;
  initializedPixelId = pixelId;
  // autoConfig off: DOM-inferred events fire without an eventID and break
  // browser/server deduplication against our CAPI events.
  fbq("set", "autoConfig", false, pixelId);
  fbq("init", pixelId);
}
