GRANT SELECT (id, name, slug_prefix, pixel_id) ON public.labels TO anon, authenticated;
GRANT ALL ON public.labels TO service_role;