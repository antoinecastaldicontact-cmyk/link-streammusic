import { useState, useEffect } from "react";
import { ReleaseConfig } from "@/config/releases";
import { getInAppBrowser } from "@/lib/tracking";

const SUBMITTED_KEY = "era_newsletter_submitted";

const FUNCTIONS_URL =
  import.meta.env.VITE_SUPABASE_URL + "/functions/v1/subscribe-newsletter";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface NewsletterSignupProps {
  release: ReleaseConfig;
}

const NewsletterSignup = ({ release }: NewsletterSignupProps) => {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );

  useEffect(() => {
    if (localStorage.getItem(SUBMITTED_KEY)) setState("success");
  }, []);

  const handleSubmit = async () => {
    if (state === "loading" || state === "success") return;
    if (!email.includes("@")) {
      setState("error");
      return;
    }
    setState("loading");

    try {
      const res = await fetch(FUNCTIONS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          email,
          release_slug: release.slug,
          artist_name: release.artist,
          genre_primary: release.genrePrimary,
          mood_tags: release.moodTags,
          track_language: release.trackLanguage,
          in_app_browser: getInAppBrowser(),
          source_url: window.location.href,
        }),
      });
      if (res.ok) {
        localStorage.setItem(SUBMITTED_KEY, "1");
        setState("success");
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  };

  if (state === "success") {
    return (
      <div className="px-4 pb-8">
        <div className="rounded-md border border-foreground/10 bg-foreground/[0.03] px-4 py-4 text-center">
          <p className="text-[14px] font-semibold text-foreground">
            ✓ Thanks, you're in.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-8">
      <div className="rounded-md border border-foreground/10 bg-foreground/[0.03] p-4">
        <p className="text-[14px] font-semibold text-foreground">
          Get the next release before anyone else.
        </p>
        <p className="text-[12px] text-foreground/60 mt-1 mb-3">
          Email only when there's something to say.
        </p>
        <div className="flex flex-col gap-2">
          <input
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (state === "error") setState("idle");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            disabled={state === "loading"}
            className="w-full bg-background border border-foreground/10 rounded-md px-4 py-3 text-[14px] text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-foreground/30 transition-colors"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={state === "loading"}
            className="bg-foreground text-background text-xs font-bold uppercase tracking-[1.5px] px-5 py-3 rounded-sm transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
          >
            {state === "loading" ? "..." : "Subscribe"}
          </button>
          {state === "error" && (
            <p className="text-[12px] text-destructive mt-1">
              Please enter a valid email.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsletterSignup;
