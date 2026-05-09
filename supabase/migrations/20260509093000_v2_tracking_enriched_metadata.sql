-- V2 tracking: extend dsp_events with enriched metadata + shared event_id.
--
-- All new columns are nullable so existing rows (V1) and any release that
-- has not been backfilled with full metadata still insert successfully.

ALTER TABLE public.dsp_events
  ADD COLUMN IF NOT EXISTS event_id TEXT,
  ADD COLUMN IF NOT EXISTS release_slug TEXT,
  ADD COLUMN IF NOT EXISTS artist_name TEXT,
  ADD COLUMN IF NOT EXISTS release_type TEXT,
  ADD COLUMN IF NOT EXISTS genre_primary TEXT,
  ADD COLUMN IF NOT EXISTS genre_secondary TEXT,
  ADD COLUMN IF NOT EXISTS label TEXT,
  ADD COLUMN IF NOT EXISTS is_new_release BOOLEAN;

-- Indexes for the most common analytics filters.
CREATE INDEX IF NOT EXISTS idx_dsp_events_event_id ON public.dsp_events (event_id);
CREATE INDEX IF NOT EXISTS idx_dsp_events_release_slug ON public.dsp_events (release_slug);
CREATE INDEX IF NOT EXISTS idx_dsp_events_genre_primary ON public.dsp_events (genre_primary);
CREATE INDEX IF NOT EXISTS idx_dsp_events_artist_name ON public.dsp_events (artist_name);
