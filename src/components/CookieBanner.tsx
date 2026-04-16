import { useState, useEffect } from "react";

interface CookieBannerProps {
  onAccept: () => void;
  onDecline: () => void;
}

const STORAGE_KEY = "era_cookie_consent";

export function getStoredConsent(): boolean | null {
  const v = localStorage.getItem(STORAGE_KEY);
  if (v === "accepted") return true;
  if (v === "declined") return false;
  return null;
}

const CookieBanner = ({ onAccept, onDecline }: CookieBannerProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (getStoredConsent() === null) setVisible(true);
  }, []);

  if (!visible) return null;

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
    onAccept();
  };

  const decline = () => {
    localStorage.setItem(STORAGE_KEY, "declined");
    setVisible(false);
    onDecline();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-foreground/10 px-5 py-4">
      <div className="max-w-[390px] mx-auto">
        <p className="text-xs text-foreground/60 mb-3">
          We use cookies for performance tracking (Meta Pixel + Stape CAPIG).
          By accepting, you allow server-side event forwarding.
        </p>
        <div className="flex gap-3">
          <button
            onClick={decline}
            className="flex-1 border border-foreground/20 text-foreground/60 text-xs font-medium uppercase tracking-[1.5px] px-4 py-2.5 hover:bg-foreground/5 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="flex-1 border border-foreground text-foreground text-xs font-medium uppercase tracking-[1.5px] px-4 py-2.5 hover:bg-foreground hover:text-background transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
