import { useState, useEffect } from "react";
import { ReleaseConfig } from "@/config/releases";
import { trackEvent } from "@/lib/tracking";
import { trackDspEvent } from "@/lib/dsp-analytics";
import CookieBanner, { getStoredConsent } from "@/components/CookieBanner";

interface ReleasePageProps {
  release: ReleaseConfig;
}

const ReleasePage = ({ release }: ReleasePageProps) => {
  const [trackingEnabled, setTrackingEnabled] = useState<boolean>(
    () => getStoredConsent() === true
  );

  useEffect(() => {
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

    trackEvent("PageView", {
      content_name: release.title,
      content_category: release.artist,
    }, trackingEnabled);
    trackDspEvent("view", undefined, trackingEnabled);
  }, [release]);

  const handleDspClick = (dspName: string) => {
    trackEvent("ViewContent", {
      content_name: release.title,
      content_category: dspName,
    }, trackingEnabled);
    trackDspEvent("click", dspName, trackingEnabled);
  };

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[390px]">
        <img
          src={release.artworkUrl}
          alt={`${release.artist} – ${release.title}`}
          className="w-full aspect-square object-cover"
        />

        <div className="text-center py-8">
          <p className="text-[13px] uppercase tracking-[3px] text-foreground/60 font-medium">
            {release.artist}
          </p>
          <h1 className="text-[28px] font-bold uppercase tracking-tight leading-tight text-foreground mt-1">
            {release.title}
          </h1>
          <p className="text-[10px] uppercase tracking-[2px] text-foreground/40 mt-1">
            {release.releaseType}
          </p>
        </div>

        <div className="h-px bg-foreground/10" />

        {release.dsps.map((dsp, i) => (
          <div key={dsp.name}>
            <div className="h-[72px] flex items-center justify-between px-5">
              <div className="flex items-center gap-4">
                <img
                  src={dsp.logo}
                  alt={dsp.name}
                  className="w-8 h-8 object-contain"
                  style={{ filter: "invert(1) brightness(0.85)" }}
                />
                <span className="text-base font-medium text-foreground">
                  {dsp.name}
                </span>
              </div>
              <a
                href={dsp.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleDspClick(dsp.name)}
                className="border border-foreground text-foreground text-xs font-medium uppercase tracking-[1.5px] px-6 py-2.5 hover:bg-foreground hover:text-background transition-colors"
              >
                PLAY
              </a>
            </div>
            {i < release.dsps.length - 1 && (
              <div className="h-px bg-foreground/10" />
            )}
          </div>
        ))}
      </div>
      <CookieBanner
        onAccept={() => setTrackingEnabled(true)}
        onDecline={() => setTrackingEnabled(false)}
      />
    </div>
  );
};

export default ReleasePage;
