import { useEffect, useRef } from "react";
import { ReleaseConfig, isNewRelease } from "@/config/releases";
import { trackEvent, type TrackEventData } from "@/lib/tracking";
import { trackDspEvent } from "@/lib/dsp-analytics";
import NewsletterSignup from "@/components/NewsletterSignup";

interface ReleasePageProps {
  release: ReleaseConfig;
}

const ReleasePage = ({ release }: ReleasePageProps) => {
  const hasSentPageView = useRef(false);

  const buildMetadata = (extra: Partial<TrackEventData> = {}): TrackEventData => ({
    content_name: release.title,
    artist_name: release.artist,
    release_type: release.releaseType,
    release_slug: release.slug,
    genre_primary: release.genrePrimary,
    genre_secondary: release.genreSecondary,
    label: release.label ?? "ERA Music",
    is_new_release: isNewRelease(release),
    mood_tags: release.moodTags,
    track_language: release.trackLanguage,
    ...extra,
  });

  const buildDspMetadata = (eventId: string) => ({
    event_id: eventId,
    release_slug: release.slug,
    artist_name: release.artist,
    release_type: release.releaseType,
    genre_primary: release.genrePrimary,
    genre_secondary: release.genreSecondary,
    label: release.label ?? "ERA Music",
    is_new_release: isNewRelease(release),
    mood_tags: release.moodTags,
    track_language: release.trackLanguage,
  });

  useEffect(() => {
    if (hasSentPageView.current) return;
    hasSentPageView.current = true;

    document.title = release.ogTitle;

    const setMeta = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", property);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("og:title", release.ogTitle);
    setMeta("og:description", release.ogDescription);
    setMeta("og:image", release.artworkUrl);
    setMeta("og:type", "music.song");

    let descEl = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!descEl) {
      descEl = document.createElement("meta");
      descEl.setAttribute("name", "description");
      document.head.appendChild(descEl);
    }
    descEl.setAttribute("content", release.ogDescription);

    (async () => {
      const eventId = await trackEvent("PageView", buildMetadata());
      await trackDspEvent("view", undefined, buildDspMetadata(eventId));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [release]);

  const handleDspClick = async (dspName: string, tracked: boolean) => {
    if (!tracked) return;
    const eventId = await trackEvent(
      "ViewContent",
      buildMetadata({
        content_category: dspName,
        dsp_chosen: dspName,
      }),
    );
    await trackDspEvent("click", dspName, buildDspMetadata(eventId));
  };

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[420px] flex flex-col">
        {/* Artwork — capped to ~36vh, centered, with fade to background */}
        <div className="relative w-full flex justify-center pt-4 pb-2">
          <div
            className="relative"
            style={{ height: "36vh", maxHeight: "360px", aspectRatio: "1 / 1" }}
          >
            <img
              src={release.artworkUrl}
              alt={`${release.artist} – ${release.title}`}
              className="h-full w-full object-cover rounded-md shadow-2xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-16"
              style={{
                background:
                  "linear-gradient(to bottom, hsl(var(--background) / 0) 0%, hsl(var(--background)) 100%)",
              }}
            />
          </div>
        </div>

        {/* Title block — compact */}
        <div className="text-center px-5 pt-2 pb-4">
          <p className="text-[12px] uppercase tracking-[3px] text-foreground/60 font-medium">
            {release.artist}
          </p>
          <h1 className="text-[24px] font-bold uppercase tracking-tight leading-tight text-foreground mt-1">
            {release.title}
          </h1>
          <p className="text-[10px] uppercase tracking-[2px] text-foreground/40 mt-1">
            {release.releaseType}
          </p>
        </div>

        {/* DSP buttons — hero, full-width filled CTAs */}
        <div className="flex flex-col gap-2 px-4 pb-8">
          {release.dsps.map((dsp) => (
            <a
              key={dsp.name}
              href={dsp.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleDspClick(dsp.name, dsp.tracked !== false)}
              className="group flex items-center justify-between gap-3 rounded-md border border-foreground/10 bg-foreground/[0.03] px-4 py-3 transition-all hover:bg-foreground/[0.08] hover:border-foreground/30 active:scale-[0.99]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={dsp.logo}
                  alt={dsp.name}
                  className="w-9 h-9 object-contain shrink-0"
                  style={
                    dsp.logo.endsWith(".svg")
                      ? { filter: "invert(1) brightness(0.95)" }
                      : undefined
                  }
                />
                <span className="text-[15px] font-semibold text-foreground truncate">
                  {dsp.name}
                </span>
              </div>
              <span className="bg-foreground text-background text-xs font-bold uppercase tracking-[1.5px] px-5 py-2.5 rounded-sm transition-transform group-hover:scale-[1.03]">
                PLAY
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReleasePage;
