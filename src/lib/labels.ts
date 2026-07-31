import { supabase } from "@/integrations/supabase/client";
import { LABEL_ERA_MUSIC_ID } from "@/config/releases";

/**
 * Client-visible label fields ONLY. `capi_secret_name` is never selected
 * here and is not readable by the anon/authenticated roles.
 */
export interface PublicLabel {
  id: string;
  name: string;
  slug_prefix: string;
  pixel_id: string;
}

/** Fallback used before the labels row resolves (ERA Music). */
export const DEFAULT_LABEL: PublicLabel = {
  id: LABEL_ERA_MUSIC_ID,
  name: "ERA Music",
  slug_prefix: "",
  pixel_id: "1272936565032247",
};

const cache = new Map<string, PublicLabel>();

export async function getLabel(labelId?: string | null): Promise<PublicLabel> {
  const id = labelId ?? LABEL_ERA_MUSIC_ID;
  const cached = cache.get(id);
  if (cached) return cached;

  try {
    const { data, error } = await supabase
      .from("labels")
      .select("id, name, slug_prefix, pixel_id")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return DEFAULT_LABEL;
    const label = data as PublicLabel;
    cache.set(id, label);
    return label;
  } catch {
    return DEFAULT_LABEL;
  }
}
