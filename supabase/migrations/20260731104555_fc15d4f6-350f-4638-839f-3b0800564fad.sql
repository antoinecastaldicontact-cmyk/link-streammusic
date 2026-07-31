CREATE TABLE public.labels (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug_prefix text NOT NULL DEFAULT '',
  pixel_id text NOT NULL,
  capi_secret_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT (id, name, slug_prefix, pixel_id) ON public.labels TO anon;
GRANT SELECT (id, name, slug_prefix, pixel_id) ON public.labels TO authenticated;
GRANT ALL ON public.labels TO service_role;

ALTER TABLE public.labels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Labels are readable by everyone"
  ON public.labels FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_labels_updated_at
BEFORE UPDATE ON public.labels
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.labels (id, name, slug_prefix, pixel_id, capi_secret_name) VALUES
  ('11111111-1111-4111-8111-111111111111', 'ERA Music', '', '1272936565032247', 'META_CAPIG_TOKEN'),
  ('22222222-2222-4222-8222-222222222222', 'CR2 Records', 'cr2', '1932831854052584', 'META_CAPIG_TOKEN_CR2');