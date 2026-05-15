CREATE TABLE IF NOT EXISTS public.email_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  hashed_email TEXT NOT NULL,
  release_slug TEXT,
  artist_name TEXT,
  genre_primary TEXT,
  mood_tags TEXT[],
  track_language TEXT,
  in_app_browser TEXT,
  country TEXT,
  source_url TEXT,
  beehiiv_synced BOOLEAN DEFAULT FALSE,
  beehiiv_subscriber_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_subscribers_release_slug
  ON public.email_subscribers (release_slug);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_genre_primary
  ON public.email_subscribers (genre_primary);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_created_at
  ON public.email_subscribers (created_at DESC);

ALTER TABLE public.email_subscribers ENABLE ROW LEVEL SECURITY;