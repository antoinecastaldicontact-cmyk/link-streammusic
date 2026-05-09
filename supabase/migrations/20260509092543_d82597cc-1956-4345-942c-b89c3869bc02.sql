ALTER TABLE public.dsp_events
  ADD COLUMN IF NOT EXISTS event_id TEXT,
  ADD COLUMN IF NOT EXISTS release_slug TEXT,
  ADD COLUMN IF NOT EXISTS artist_name TEXT,
  ADD COLUMN IF NOT EXISTS release_type TEXT,
  ADD COLUMN IF NOT EXISTS genre_primary TEXT,
  ADD COLUMN IF NOT EXISTS genre_secondary TEXT,
  ADD COLUMN IF NOT EXISTS label TEXT,
  ADD COLUMN IF NOT EXISTS is_new_release BOOLEAN;

CREATE INDEX IF NOT EXISTS idx_dsp_events_event_id ON public.dsp_events (event_id);
CREATE INDEX IF NOT EXISTS idx_dsp_events_release_slug ON public.dsp_events (release_slug);
CREATE INDEX IF NOT EXISTS idx_dsp_events_genre_primary ON public.dsp_events (genre_primary);
CREATE INDEX IF NOT EXISTS idx_dsp_events_artist_name ON public.dsp_events (artist_name);

ALTER TABLE public.dsp_events
  ADD COLUMN IF NOT EXISTS mood_tags TEXT[],
  ADD COLUMN IF NOT EXISTS track_language TEXT;

CREATE INDEX IF NOT EXISTS idx_dsp_events_track_language ON public.dsp_events (track_language);
CREATE INDEX IF NOT EXISTS idx_dsp_events_mood_tags ON public.dsp_events USING GIN (mood_tags);