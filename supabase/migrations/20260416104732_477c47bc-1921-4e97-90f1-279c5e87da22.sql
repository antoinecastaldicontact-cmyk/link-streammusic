
CREATE TABLE public.dsp_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  event_type TEXT NOT NULL,
  dsp_name TEXT,
  page_path TEXT NOT NULL,
  external_id TEXT,
  user_agent TEXT
);

-- Enable RLS
ALTER TABLE public.dsp_events ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (tracking events from visitors)
CREATE POLICY "Anyone can insert dsp_events"
ON public.dsp_events
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow authenticated reads (for analytics page)
CREATE POLICY "Authenticated users can read dsp_events"
ON public.dsp_events
FOR SELECT
TO authenticated
USING (true);

-- Allow anonymous reads too (analytics page doesn't require login per spec)
CREATE POLICY "Anonymous users can read dsp_events"
ON public.dsp_events
FOR SELECT
TO anon
USING (true);

-- Index for common query patterns
CREATE INDEX idx_dsp_events_event_type ON public.dsp_events (event_type);
CREATE INDEX idx_dsp_events_page_path ON public.dsp_events (page_path);
CREATE INDEX idx_dsp_events_created_at ON public.dsp_events (created_at);
