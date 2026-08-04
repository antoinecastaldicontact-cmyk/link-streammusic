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
let initPending = false;

type Fbq = (...args: unknown[]) => void;

/** Browser fbq("track", …) calls made before the pixel was ready. */
const pendingTracks: unknown[][] = [];

function getFbq(): Fbq | undefined {
  return (window as unknown as { fbq?: Fbq }).fbq;
}

export function isPixelReady(): boolean {
  return initializedPixelId !== null;
}

/** Buffer a browser-side fbq call until the pixel is initialised. */
export function queueFbqTrack(args: unknown[]) {
  console.warn("[pixel] fbq not ready — buffering call:", args[1], args[3]);
  pendingTracks.push(args);
}

function flushPendingTracks() {
  const fbq = getFbq();
  if (!fbq) return;
  while (pendingTracks.length) {
    const args = pendingTracks.shift()!;
    console.log("[pixel] flushing buffered fbq call:", args[1], args[3]);
    fbq(...args);
  }
}

const RETRY_INTERVAL_MS = 100;
const MAX_WAIT_MS = 5000;

/** Initialise exactly one Meta pixel per page (idempotent, retries for fbq). */
export function initPixel(pixelId: string) {
  if (initializedPixelId || initPending) return;

  const doInit = (fbq: Fbq) => {
    initializedPixelId = pixelId;
    initPending = false;
    // autoConfig off: DOM-inferred events fire without an eventID and break
    // browser/server deduplication against our CAPI events.
    fbq("set", "autoConfig", false, pixelId);
    fbq("init", pixelId);
    flushPendingTracks();
  };

  const fbq = getFbq();
  if (fbq) {
    doInit(fbq);
    return;
  }

  initPending = true;
  console.warn("[pixel] fbq unavailable — deferring init, retrying every 100ms (5s cap)");
  const start = Date.now();
  const timer = setInterval(() => {
    const f = getFbq();
    if (f) {
      clearInterval(timer);
      doInit(f);
      return;
    }
    if (Date.now() - start >= MAX_WAIT_MS) {
      clearInterval(timer);
      initPending = false;
      console.error(
        "[pixel] fbq still unavailable after 5s — browser pixel not initialised (server events unaffected).",
      );
    }
  }, RETRY_INTERVAL_MS);
}

