import { useEffect, useState } from "react";
import { DSP } from "@/config/releases";

const SESSION_KEY = "era_visitor_country";

const FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_URL + "/functions/v1/visitor-country";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/**
 * Returns the visitor's ISO-2 country code, or null while resolving.
 */
export function useVisitorCountry(): string | null {
  const [country, setCountry] = useState<string | null>(() => {
    return sessionStorage.getItem(SESSION_KEY);
  });

  useEffect(() => {
    if (country) return;

    fetch(FUNCTIONS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "apikey": SUPABASE_ANON_KEY,
      },
    })
      .then((r) => r.json())
      .then((data) => {
        const c = data.country || "XX";
        sessionStorage.setItem(SESSION_KEY, c);
        setCountry(c);
      })
      .catch(() => {
        sessionStorage.setItem(SESSION_KEY, "XX");
        setCountry("XX");
      });
  }, [country]);

  return country;
}

/**
 * Pure utility for filtering DSPs based on the visitor's country.
 */
export function filterDspsByCountry(
  dsps: DSP[],
  country: string | null,
): DSP[] {
  return dsps.filter((dsp) => {
    const hasRule = dsp.countries || dsp.excludeCountries;
    if (!hasRule) return true;
    if (!country || country === "XX") return false;

    if (dsp.countries && !dsp.countries.includes(country)) return false;
    if (dsp.excludeCountries && dsp.excludeCountries.includes(country)) return false;
    return true;
  });
}
