/**
 * Meta browser pixel bootstrap.
 *
 * Exactly ONE pixel is initialised per page load — the one belonging to the
 * release's label. Repeated calls are no-ops (and a mismatching second call
 * is ignored + warned) so two datasets can never be initialised together.
 */

type Fbq = ((...args: unknown[]) => void) & { queue?: unknown[] };

let initializedPixelId: string | null = null;

export function getInitializedPixelId(): string | null {
  return initializedPixelId;
}

export function initMetaPixel(pixelId: string): void {
  if (typeof window === "undefined") return;
  const fbq = (window as unknown as { fbq?: Fbq }).fbq;
  if (!fbq) return;

  if (initializedPixelId) {
    if (initializedPixelId !== pixelId) {
      console.warn(
        `[meta-pixel] Pixel ${initializedPixelId} already initialised on this page; ignoring ${pixelId}.`,
      );
    }
    return;
  }

  // Disable auto-config: DOM-inferred events fire without an eventID and
  // would break browser/server deduplication.
  fbq("set", "autoConfig", false, pixelId);
  fbq("init", pixelId);
  initializedPixelId = pixelId;
}
