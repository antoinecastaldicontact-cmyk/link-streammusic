-- V2.1 tracking: add mood_tags (multi-value) and track_language to dsp_events.
--
-- mood_tags is a text[] (Postgres array) so we can filter with the @> operator
-- e.g. WHERE mood_tags @> ARRAY['running'] for analytics breakdowns.

ALTER TABLE public.dsp_events
  ADD COLUMN IF NOT EXISTS mood_tags TEXT[],
  ADD COLUMN IF NOT EXISTS track_language TEXT;

CREATE INDEX IF NOT EXISTS idx_dsp_events_track_language ON public.dsp_events (track_language);
-- GIN index lets us efficiently query rows containing a given mood tag.
CREATE INDEX IF NOT EXISTS idx_dsp_events_mood_tags ON public.dsp_events USING GIN (mood_tags);
