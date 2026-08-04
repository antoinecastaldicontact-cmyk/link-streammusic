export interface PublicLabel {
  name: string;
  slug_prefix: string;
  pixel_id: string;
}

/** ERA Music — default dataset used when a release has no labelId. */
export const DEFAULT_PIXEL_ID = "1272936565032247";
export const DEFAULT_LABEL_NAME = "ERA Music";

/**
 * Browser-only build-time mapping. The labels table remains the source of
 * truth for server-side CAPI resolution in track-meta.
 */
export const PIXEL_LABELS: readonly PublicLabel[] = [
  { name: DEFAULT_LABEL_NAME, slug_prefix: "", pixel_id: DEFAULT_PIXEL_ID },
  { name: "CR2 Records", slug_prefix: "cr2", pixel_id: "1932831854052584" },
];

/**
 * Resolve the label synchronously from the URL slug prefix.
 * The first path segment is matched against the static mapping; no match → ERA.
 * `releaseLabelId` is only used to warn on contradictions, never to decide.
 */
export function resolveLabelFromUrl(
  pathname: string = window.location.pathname,
): { name: string; pixelId: string } {
  const firstSegment = pathname.split("/").filter(Boolean)[0]?.toLowerCase() ?? "";
  const match = PIXEL_LABELS.find(
    (l) => (l.slug_prefix ?? "").toLowerCase().replace(/^\/|\/$/g, "") === firstSegment,
  );

  if (!match) {
    console.warn(
      `[pixel] unknown label prefix "${firstSegment}" — falling back to ${DEFAULT_LABEL_NAME}.`,
    );
    return { name: DEFAULT_LABEL_NAME, pixelId: DEFAULT_PIXEL_ID };
  }

  return { name: match.name, pixelId: match.pixel_id || DEFAULT_PIXEL_ID };
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
    const args = pendingTracks.shift();
    if (!args) return;
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

// Resolve and initialise during module evaluation, before React renders or
// release-specific effects run. fbq's bootstrap queue is already created by
// the static head script; retry/buffering remains as a safety net.
if (typeof window !== "undefined") {
  const resolvedLabel = resolveLabelFromUrl(window.location.pathname);
  console.log(`[pixel] label="${resolvedLabel.name}" pixel_id=${resolvedLabel.pixelId}`);
  initPixel(resolvedLabel.pixelId);
}

