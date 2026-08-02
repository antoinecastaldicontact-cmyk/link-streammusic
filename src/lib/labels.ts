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
    labelsPromise = (async () => {
      const { data, error } = await supabase
        .from("labels")
        .select("id,name,slug_prefix,pixel_id");
      if (error) {
        labelsPromise = null;
        console.error("labels fetch error:", error.message);
        return [];
      }
      return (data ?? []) as PublicLabel[];
    })();
  }
  return labelsPromise;
}

export const DEFAULT_LABEL_NAME = "ERA Music";

/**
 * Resolve the label from the URL slug prefix — exactly like track-meta does.
 * The first path segment is matched against labels.slug_prefix; no match → ERA.
 * `releaseLabelId` is only used to warn on contradictions, never to decide.
 */
export async function resolveLabelFromUrl(
  pathname: string = window.location.pathname,
  releaseLabelId?: string,
): Promise<{ name: string; pixelId: string; labelId?: string }> {
  const firstSegment = pathname.split("/").filter(Boolean)[0]?.toLowerCase() ?? "";
  let labels: PublicLabel[] = [];
  try {
    labels = await fetchLabels();
  } catch {
    labels = [];
  }

  const match = labels.find(
    (l) => (l.slug_prefix ?? "").toLowerCase().replace(/^\/|\/$/g, "") === firstSegment,
  );

  const resolved = match
    ? { name: match.name, pixelId: match.pixel_id || DEFAULT_PIXEL_ID, labelId: match.id }
    : { name: DEFAULT_LABEL_NAME, pixelId: DEFAULT_PIXEL_ID, labelId: undefined };

  if (releaseLabelId && releaseLabelId !== resolved.labelId) {
    console.warn(
      `[labels] release labelId "${releaseLabelId}" contradicts URL prefix "${firstSegment}" — using URL prefix (${resolved.name}).`,
    );
  }

  return resolved;
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
