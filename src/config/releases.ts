export interface DSP {
  name: string;
  logo: string;
  url: string;
  /** When false, click is not sent to Meta CAPI / pixel. Defaults to true. */
  tracked?: boolean;
  /** If set, DSP appears only for visitors from these countries (ISO-2). */
  countries?: string[];
  /** If set, DSP is hidden from visitors of these countries (ISO-2). */
  excludeCountries?: string[];
}

/**
 * European countries (France included). Used by region-restricted DSPs
 * to define exclusion zones (e.g. Amazon Music hidden in Europe) or
 * inclusion zones (e.g. YouTube shown only in Rest of World).
 */
export const EUROPE_COUNTRIES = [
  "FR", "DE", "ES", "IT", "NL", "BE", "GB", "IE", "PT", "AT", "CH",
  "SE", "NO", "DK", "FI", "PL", "CZ", "GR", "HU", "RO", "BG", "HR",
  "SK", "SI", "LT", "LV", "EE", "LU", "MT", "CY", "IS",
] as const;

export const NORTH_AMERICA_COUNTRIES = ["US", "CA"] as const;

/**
 * Rest of World = all countries NOT in Europe and NOT in North America.
 * Used by YouTube (visible only in RoW, never tracked).
 * Explicit allowlist for predictable filtering (no negative match).
 */
export const REST_OF_WORLD_COUNTRIES = [
  // Latin America
  "BR", "MX", "AR", "CL", "CO", "PE", "VE", "UY", "EC", "BO", "PY",
  "CR", "PA", "DO", "GT", "HN", "SV", "NI", "CU", "PR",
  // Asia-Pacific
  "JP", "KR", "CN", "TW", "HK", "SG", "TH", "VN", "ID", "PH", "MY",
  "IN", "PK", "BD", "LK", "NP", "AU", "NZ",
  // Middle East & North Africa
  "AE", "SA", "QA", "KW", "BH", "OM", "JO", "LB", "EG", "MA", "DZ",
  "TN", "IL", "TR", "IR", "IQ",
  // Sub-Saharan Africa
  "ZA", "NG", "KE", "GH", "SN", "CI", "CM", "ET", "TZ", "UG", "ZW",
  "AO", "MZ", "RW",
  // Eastern Europe non-EU, Caucasus, Central Asia
  "RU", "UA", "BY", "MD", "RS", "ME", "MK", "AL", "BA", "XK", "GE",
  "AM", "AZ", "MN", "KZ", "UZ", "KG", "TJ", "TM",
] as const;

export type EraGenre =
  | "melodic_techno"
  | "deep_house"
  | "house"
  | "organic_house"
  | "downtempo"
  | "progressive"
  | "indie_dance"
  | "afro_house"
  | "afrobeat"
  | "slap_house"
  | "dance"
  | "pop"
  | (string & {});

export type MoodTag =
  | "running"
  | "sport"
  | "training"
  | "chill"
  | "focus"
  | "late_night"
  | "sunset"
  | "drive"
  | "party"
  | (string & {});

export type TrackLanguage =
  | "fr"
  | "en"
  | "es"
  | "pt"
  | "de"
  | "it"
  | "instrumental"
  | (string & {});

export interface ReleaseConfig {
  slug: string;
  artist: string;
  title: string;
  releaseType: "Single" | "EP" | "Album" | "Compilation";
  artworkUrl: string;
  ogTitle: string;
  ogDescription: string;
  dsps: DSP[];
  genrePrimary?: EraGenre;
  label?: string;
  releaseDate?: string;
  moodTags?: MoodTag[];
  trackLanguage?: TrackLanguage;
  shopUrl?: string;
}

const NEW_RELEASE_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

export function isNewRelease(release: ReleaseConfig): boolean | undefined {
  if (!release.releaseDate) return undefined;
  const released = new Date(release.releaseDate).getTime();
  if (Number.isNaN(released)) return undefined;
  return Date.now() - released < NEW_RELEASE_WINDOW_MS;
}

export const releases: ReleaseConfig[] = [
  {
    slug: "jamy-nox-otra-vez",
    artist: "Jamy Nox",
    title: "Otra Vez",
    releaseType: "Single",
    artworkUrl: "/artworks/jamy-nox-otra-vez.webp",
    ogTitle: "Jamy Nox - Otra Vez",
    ogDescription: "Listen to Otra Vez by Jamy Nox, out now on all platforms.",
    dsps: [
      {
        name: "Spotify",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/spotify.svg",
        url: "https://open.spotify.com/intl-fr/track/1vm9FqNTk1C6Az2SAtxq1b?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=jamy-nox-otra-vez&utm_content=spotify",
      },
      {
        name: "Apple Music",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/applemusic.svg",
        url: "https://geo.music.apple.com/album/otra-vez-feat-luc%C3%ADa-haze/6783829260?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=jamy-nox-otra-vez&utm_content=apple_music",
      },
      {
        name: "Amazon Music",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/amazonmusic.svg",
        url: "https://music.amazon.com/albums/B0H6G3L1TB?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=jamy-nox-otra-vez&utm_content=amazon_music",
        excludeCountries: [...EUROPE_COUNTRIES],
      },
      {
        name: "YouTube",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/youtube.svg",
        url: "https://www.youtube.com/watch?v=a-b8ZKyMspw&utm_source=fanlinkhub&utm_medium=referral&utm_campaign=jamy-nox-otra-vez&utm_content=youtube",
        countries: [...REST_OF_WORLD_COUNTRIES],
        tracked: false,
      },
      {
        name: "Beatport",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/beatport.svg",
        url: "https://www.beatport.com/fr/release/otra-vez-extended-mix/7121002?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=jamy-nox-otra-vez&utm_content=beatport",
        tracked: false,
      },
    ],
    genrePrimary: "afro_house",
    label: "CR2 Records",
    releaseDate: "2026-07-10",
    moodTags: ["party"],
    trackLanguage: "en",
  },
  {
    slug: "matt-sassari-mont-rouge-wav-of-luv",
    artist: "Matt Sassari, Mont Rouge",
    title: "Wav Of Luv",
    releaseType: "Single",
    artworkUrl: "/artworks/matt-sassari-mont-rouge-wav-of-luv.webp",
    ogTitle: "Matt Sassari, Mont Rouge - Wav Of Luv",
    ogDescription: "Listen to Wav Of Luv by Matt Sassari, Mont Rouge, out now on all platforms.",
    dsps: [
        {
          name: "Spotify",
          logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/spotify.svg",
          url: "https://open.spotify.com/intl-fr/track/4kmxETbclaI5PF9uqKKM8q?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=matt-sassari-mont-rouge-wav-of-luv&utm_content=spotify",
        },
        {
          name: "Apple Music",
          logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/applemusic.svg",
          url: "https://geo.music.apple.com/album/waves-of-luv/6780914450?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=matt-sassari-mont-rouge-wav-of-luv&utm_content=apple_music",
        },
        {
          name: "Beatport",
          logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/beatport.svg",
          url: "https://www.beatport.com/release/waves-of-luv-extended-mix/7079271?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=matt-sassari-mont-rouge-wav-of-luv&utm_content=beatport",
        },
        {
          name: "Amazon Music",
          logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/amazonmusic.svg",
          url: "https://music.amazon.fr/tracks/B0H5KSK3MF?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=matt-sassari-mont-rouge-wav-of-luv&utm_content=amazon_music",
          excludeCountries: [...EUROPE_COUNTRIES],
        },
        {
          name: "YouTube",
          logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/youtube.svg",
          url: "https://www.youtube.com/watch?v=irbwOxGGatQ&utm_source=fanlinkhub&utm_medium=referral&utm_campaign=matt-sassari-mont-rouge-wav-of-luv&utm_content=youtube",
          countries: [...REST_OF_WORLD_COUNTRIES],
          tracked: false,
        }
    ],
    genrePrimary: "dance",
    label: "CR2",
    releaseDate: "2026-07-03",
    moodTags: ["party", "running"],
    trackLanguage: "en",
  },
  {
    slug: "the-good-son-wake-up",
    artist: "The Good Son",
    title: "Wake Up",
    releaseType: "Single",
    artworkUrl: "/artworks/the-good-son-wake-up.jpg",
    ogTitle: "The Good Son - Wake Up",
    ogDescription: "Listen to Wake Up by The Good Son, out now on all platforms.",
    dsps: [
      {
        name: "Spotify",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/spotify.svg",
        url: "https://open.spotify.com/intl-fr/track/2EjAA8OvZj9lMcLyaOafak?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=the-good-son-wake-up&utm_content=spotify",
      },
      {
        name: "Apple Music",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/applemusic.svg",
        url: "https://geo.music.apple.com/album/wake-up/6777042940?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=the-good-son-wake-up&utm_content=apple_music",
      },
      {
        name: "Amazon Music",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/amazonmusic.svg",
        url: "https://music.amazon.fr/tracks/B0H46BR87GJJvtdW90NrAn1toCQUrE?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=the-good-son-wake-up&utm_content=amazon_music",
        excludeCountries: [...EUROPE_COUNTRIES],
      },
      {
        name: "YouTube",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/youtube.svg",
        url: "https://www.youtube.com/watch?v=4_zRPESXHmk&utm_source=fanlinkhub&utm_medium=referral&utm_campaign=the-good-son-wake-up&utm_content=youtube",
        countries: [...REST_OF_WORLD_COUNTRIES],
        tracked: false,
      },
    ],
    genrePrimary: "indie_dance",
    label: "ERA Music",
    releaseDate: "2026-07-03",
    moodTags: ["running", "sport", "training", "party"],
    trackLanguage: "en",
  },
  {
    slug: "coco-breezy-tonight",
    artist: "Coco & Breezy",
    title: "Tonight",
    releaseType: "Single",
    artworkUrl: "/artworks/coco-breezy-tonight.webp",
    ogTitle: "Coco & Breezy - Tonight",
    ogDescription: "Listen to Tonight by Coco & Breezy, out now on all platforms.",
    dsps: [
      {
        name: "Spotify",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/spotify.svg",
        url: "https://open.spotify.com/intl-fr/track/4PjL6RLTiycYZItjJH53qb?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=coco-breezy-tonight&utm_content=spotify",
      },
      {
        name: "Apple Music",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/applemusic.svg",
        url: "https://geo.music.apple.com/album/tonight/6771260579?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=coco-breezy-tonight&utm_content=apple_music",
      },
      {
        name: "Amazon Music",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/amazonmusic.svg",
        url: "https://music.amazon.fr/albums/B0H2D4XJBX?marketplaceId=A13V1IB3VIYZZH&musicTerritory=FR&ref=dm_sh_wAgfGLBfMPIcsfvH156STrrNo&trackAsin=B0H2D5BVR8&utm_source=fanlinkhub&utm_medium=referral&utm_campaign=coco-breezy-tonight&utm_content=amazon_music",
        excludeCountries: [...EUROPE_COUNTRIES],
      },
      {
        name: "YouTube",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/youtube.svg",
        url: "https://www.youtube.com/watch?v=Q4nWFl06Slc&utm_source=fanlinkhub&utm_medium=referral&utm_campaign=coco-breezy-tonight&utm_content=youtube",
        countries: [...REST_OF_WORLD_COUNTRIES],
        tracked: false,
      },
    ],
    genrePrimary: "deep_house",
    label: "/",
    releaseDate: "2026-06-19",
    moodTags: ["sunset"],
    trackLanguage: "en",
  },
  {
    slug: "mooglie-mont-rouge-your-body",
    artist: "Mooglie, Mont Rouge",
    title: "Your Body",
    releaseType: "Single",
    artworkUrl: "/artworks/mooglie-mont-rouge-your-body.jpg",
    ogTitle: "Mooglie, Mont Rouge - Your Body",
    ogDescription: "Listen to Your Body by Mooglie, Mont Rouge, out now on all platforms.",
    dsps: [
      {
        name: "Spotify",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/spotify.svg",
        url: "https://open.spotify.com/intl-fr/track/2T0JzlCoiAahbFkhTwWWCY?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=mooglie-mont-rouge-your-body&utm_content=spotify",
      },
      {
        name: "Apple Music",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/applemusic.svg",
        url: "https://geo.music.apple.com/album/your-body-2026-version/6773370073?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=mooglie-mont-rouge-your-body&utm_content=apple_music",
      },
    ],
    genrePrimary: "afro_house",
    label: "Ultra",
    releaseDate: "2026-06-05",
    moodTags: ["party"],
    trackLanguage: "en",
  },
  {
    slug: "nicky-doll-in-your-head-ft-anton-power-remix",
    artist: "Nicky Doll",
    title: "In Your Head (feat. Anton Power Remix)",
    releaseType: "Single",
    artworkUrl: "/artworks/nicky-doll-in-your-head.jpg",
    ogTitle: "Nicky Doll - In Your Head (feat. Anton Power Remix)",
    ogDescription: "Listen to In Your Head (feat. Anton Power Remix) by Nicky Doll, out now on all platforms.",
    dsps: [
      {
        name: "Spotify",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/spotify.svg",
        url: "https://open.spotify.com/intl-fr/track/7CHXm4iNl6Bna7B7RbXkqk?si=a2c1e06770e8429d&utm_source=fanlinkhub&utm_medium=referral&utm_campaign=nicky-doll-in-your-head-ft-anton-power-remix&utm_content=spotify",
      },
      {
        name: "Apple Music",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/applemusic.svg",
        url: "https://geo.music.apple.com/album/in-your-head-la-di-da-da-anton-powers-remix/6771034328?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=nicky-doll-in-your-head-ft-anton-power-remix&utm_content=apple_music",
      },
      {
        name: "Deezer",
        logo: "/icons/deezer.webp",
        url: "https://link.deezer.com/s/33t0uFf5FiuWJnB1QuUo2?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=nicky-doll-in-your-head-ft-anton-power-remix&utm_content=deezer",
        countries: ["FR"],
      },
    ],
    genrePrimary: "dance",
    label: "External",
    releaseDate: "2026-06-05",
    moodTags: ["party", "running"],
    trackLanguage: "en",
  },
  {
    slug: "nicky-doll-in-your-head-ft-luv-fondation-uk-ruff-loardez-remix",
    artist: "Nicky Doll",
    title: "In Your Head (feat. Luv Fondation UK, Ruff Loardez Remix)",
    releaseType: "Single",
    artworkUrl: "/artworks/nicky-doll-in-your-head.jpg",
    ogTitle: "Nicky Doll - In Your Head (feat. Luv Fondation UK, Ruff Loardez Remix)",
    ogDescription: "Listen to In Your Head (feat. Luv Fondation UK, Ruff Loardez Remix) by Nicky Doll, out now on all platforms.",
    dsps: [
      {
        name: "Spotify",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/spotify.svg",
        url: "https://open.spotify.com/intl-fr/track/2YCiJ76gfzVR6KYHQI8MIK?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=nicky-doll-in-your-head-ft-luv-fondation-uk-ruff-loardez-remix&utm_content=spotify",
      },
      {
        name: "Apple Music",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/applemusic.svg",
        url: "https://geo.music.apple.com/album/in-your-head-la-di-da-da-luv-foundation-uk-x-ruff-loaderz-remix/6771034328?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=nicky-doll-in-your-head-ft-luv-fondation-uk-ruff-loardez-remix&utm_content=apple_music",
      },
      {
        name: "Deezer",
        logo: "/icons/deezer.webp",
        url: "https://link.deezer.com/s/33t0Ri2TloK1S4sRgmanw?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=nicky-doll-in-your-head-ft-luv-fondation-uk-ruff-loardez-remix&utm_content=deezer",
        countries: ["FR"],
        tracked: false,
      },
    ],
    genrePrimary: "dance",
    label: "External",
    releaseDate: "2026-06-05",
    moodTags: ["party", "running"],
    trackLanguage: "en",
  },
  {
    slug: "nicky-doll-in-your-head-ft-vendom-remix",
    artist: "Nicky Doll",
    title: "In Your Head (feat. Vendom Remix)",
    releaseType: "Single",
    artworkUrl: "/artworks/nicky-doll-in-your-head-ft-vendom-remix.jpg",
    ogTitle: "Nicky Doll - In Your Head (feat. Vendom Remix)",
    ogDescription: "Listen to In Your Head (feat. Vendom Remix) by Nicky Doll, out now on all platforms.",
    dsps: [
      {
        name: "Spotify",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/spotify.svg",
        url: "https://open.spotify.com/intl-fr/track/2iIWY96NSs5Q4WfxYAf4rQ?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=nicky-doll-in-your-head-ft-vendom-remix&utm_content=spotify",
      },
      {
        name: "Apple Music",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/applemusic.svg",
        url: "https://geo.music.apple.com/album/in-your-head-la-di-da-da-vendom-remix/6771034328?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=nicky-doll-in-your-head-ft-vendom-remix&utm_content=apple_music",
      },
      {
        name: "Deezer",
        logo: "/icons/deezer.webp",
        url: "https://link.deezer.com/s/33t0Jc9YcEPP3NEFe14AE?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=nicky-doll-in-your-head-ft-vendom-remix&utm_content=deezer",
        countries: ["FR"],
        tracked: false,
      },
    ],
    genrePrimary: "dance",
    label: "External",
    releaseDate: "2026-06-05",
    moodTags: ["party", "running"],
    trackLanguage: "en",
  },
  {
    slug: "nicky-doll-in-your-head-ft-daniel-distinkt-remix",
    artist: "Nicky Doll",
    title: "In Your Head (feat. Daniel Distinkt Remix)",
    releaseType: "Single",
    artworkUrl: "/artworks/nicky-doll-in-your-head-ft-daniel-distinkt-remix.jpg",
    ogTitle: "Nicky Doll - In Your Head (feat. Daniel Distinkt Remix)",
    ogDescription: "Listen to In Your Head (feat. Daniel Distinkt Remix) by Nicky Doll, out now on all platforms.",
    dsps: [
      {
        name: "Spotify",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/spotify.svg",
        url: "https://open.spotify.com/intl-fr/track/33vwe0t7tYwwFvtqSFohhn?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=nicky-doll-in-your-head-ft-daniel-distinkt-remix&utm_content=spotify",
      },
      {
        name: "Apple Music",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/applemusic.svg",
        url: "https://geo.music.apple.com/album/in-your-head-la-di-da-da-daniel-distinkt-remix/6771034328?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=nicky-doll-in-your-head-ft-daniel-distinkt-remix&utm_content=apple_music",
      },
      {
        name: "Deezer",
        logo: "/icons/deezer.webp",
        url: "https://link.deezer.com/s/33t0DP5AEOZ2swRKkwoJx?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=nicky-doll-in-your-head-ft-daniel-distinkt-remix&utm_content=deezer",
        countries: ["FR"],
        tracked: false,
      },
    ],
    genrePrimary: "dance",
    label: "External",
    releaseDate: "2026-06-05",
    moodTags: ["party", "running"],
    trackLanguage: "en",
  },
  {
    slug: "nicky-doll-in-your-head",
    artist: "Nicky Doll",
    title: "In Your Head",
    releaseType: "Single",
    artworkUrl: "/artworks/nicky-doll-in-your-head.jpg",
    ogTitle: "Nicky Doll - In Your Head",
    ogDescription: "Listen to In Your Head by Nicky Doll, out now on all platforms.",
    dsps: [
      {
        name: "Spotify",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/spotify.svg",
        url: "https://open.spotify.com/intl-fr/track/6hNCCCELgZzldNHCZs4ptk?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=nicky-doll-in-your-head&utm_content=spotify",
      },
      {
        name: "Apple Music",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/applemusic.svg",
        url: "https://geo.music.apple.com/album/in-your-head-la-di-da-da/6771034328?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=nicky-doll-in-your-head&utm_content=apple_music",
      },
      {
        name: "Deezer",
        logo: "/icons/deezer.webp",
        url: "https://link.deezer.com/s/33t0uFf5FiuWJnB1QuUo2?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=nicky-doll-in-your-head&utm_content=deezer",
        countries: ["FR"],
      },
    ],
    genrePrimary: "dance",
    label: "External",
    releaseDate: "2026-06-05",
    moodTags: ["party", "running"],
    trackLanguage: "en",
  },
  {
    slug: "jaidyn-hurst-every-wrong-right",
    artist: "Jaidyn Hurst",
    title: "Every Wrong Right",
    releaseType: "Single",
    artworkUrl: "/artworks/jaidyn-hurst-every-wrong-right.webp",
    ogTitle: "Jaidyn Hurst - Every Wrong Right",
    ogDescription: "Listen to Every Wrong Right by Jaidyn Hurst, out now on all platforms.",
    dsps: [
        {
          name: "Spotify",
          logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/spotify.svg",
          url: "https://open.spotify.com/intl-fr/track/5CeAlxayFUAM3Oov7TBLxW?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=jaidyn-hurst-every-wrong-right&utm_content=spotify",
        },
        {
          name: "Apple Music",
          logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/applemusic.svg",
          url: "https://geo.music.apple.com/album/every-wrong-right/1896380483?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=jaidyn-hurst-every-wrong-right&utm_content=apple_music",
        },
        {
          name: "Amazon Music",
          logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/amazonmusic.svg",
          url: "https://music.amazon.fr/albums/B0GZTRHWWS?marketplaceId=A13V1IB3VIYZZH&musicTerritory=FR&ref=dm_sh_USI6FbSeScFRCXiwExR69OgmC&trackAsin=B0GZTQH4W6&utm_source=fanlinkhub&utm_medium=referral&utm_campaign=jaidyn-hurst-every-wrong-right&utm_content=amazon_music",
          excludeCountries: [...EUROPE_COUNTRIES],
        },
    ],
    genrePrimary: "pop",
    label: "External",
    releaseDate: "2026-06-05",
    moodTags: ["chill", "acoustic"],
    trackLanguage: "en",
  },
  {
    slug: "raeya-chen-moons-stars",
    artist: "Raeya Chen",
    title: "Moons & Stars 星月",
    releaseType: "Single",
    artworkUrl: "/artworks/raeya-chen-moons-stars.jpg",
    ogTitle: "Raeya Chen - Moons & Stars 星月",
    ogDescription: "Listen to Moons & Stars 星月 by Raeya Chen, out now on all platforms.",
    dsps: [
        {
          name: "Spotify",
          logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/spotify.svg",
          url: "https://open.spotify.com/intl-fr/track/3runNiueacreQU5KfxWXIL?si=6bedc5f10cfe4f4b&utm_source=fanlinkhub&utm_medium=referral&utm_campaign=raeya-chen-moons-stars&utm_content=spotify",
        },
        {
          name: "Apple Music",
          logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/applemusic.svg",
          url: "https://geo.music.apple.com/album/moons-stars-%E6%98%9F%E6%9C%88-single/6775851035?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=raeya-chen-moons-stars&utm_content=apple_music",
        },
        {
          name: "Deezer",
          logo: "/icons/deezer.webp",
          url: "https://www.deezer.com/track/4007707021?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=raeya-chen-moons-stars&utm_content=deezer",
          countries: ["FR"],
        },
        {
          name: "YouTube",
          logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/youtube.svg",
          url: "https://www.youtube.com/watch?v=kNaVm93QcVs&utm_source=fanlinkhub&utm_medium=referral&utm_campaign=raeya-chen-moons-stars&utm_content=youtube",
          countries: [...REST_OF_WORLD_COUNTRIES],
          tracked: false,
        }
    ],
    genrePrimary: "dance",
    label: "ERA Music",
    releaseDate: "2026-06-05",
    moodTags: ["sport", "chinese"],
    trackLanguage: "en",
  },
  {
    slug: "jon-norris-the-flame",
    artist: "Jon Norris",
    title: "The Flame",
    releaseType: "Single",
    artworkUrl: "/artworks/715C2DE4-BFE2-42AE-8E12-53AB18D4DFF4.jpg",
    ogTitle: "Jon Norris - The Flame",
    ogDescription: "Listen to The Flame by Jon Norris, out now on all platforms.",
    dsps: [
      {
        name: "Spotify",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/spotify.svg",
        url: "https://open.spotify.com/intl-fr/track/0ln8D8qRJu5iwALKOEjLYH?si=082c35716c484f3d&utm_source=fanlinkhub&utm_medium=referral&utm_campaign=jon-norris-the-flame&utm_content=spotify",
      },
      {
        name: "Apple Music",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/applemusic.svg",
        url: "https://geo.music.apple.com/album/the-flame/6767533373?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=jon-norris-the-flame&utm_content=apple_music",
      },
    ],
    genrePrimary: "pop",
    label: "ERA Music",
    releaseDate: "2026-05-28",
    moodTags: ["chill", "wedding"],
    trackLanguage: "en",
  },
  {
    slug: "ryu-junior-rodeo",
    artist: "Ryu Junior",
    title: "Rodeo",
    releaseType: "Single",
    artworkUrl: "/artworks/RODEO2.jpg",
    ogTitle: "Ryu Junior - Rodeo",
    ogDescription: "Listen to Rodeo by Ryu Junior, out now on all platforms.",
    dsps: [
      {
        name: "Spotify",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/spotify.svg",
        url: "https://open.spotify.com/intl-fr/track/4hEYkH9bBbSEHNrts1iz3a?si=b40d3b8b3aed40a7&utm_source=fanlinkhub&utm_medium=referral&utm_campaign=ryu-junior-rodeo&utm_content=spotify",
      },
      {
        name: "Apple Music",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/applemusic.svg",
        url: "https://geo.music.apple.com/album/rodeo/6771036194?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=ryu-junior-rodeo&utm_content=apple_music",
      },
      {
        name: "Amazon Music",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/amazonmusic.svg",
        url: "https://music.amazon.com/albums/B0H11JZS7L",
        excludeCountries: [...EUROPE_COUNTRIES],
      },
      {
        name: "Deezer",
        logo: "/icons/deezer.webp",
        url: "https://www.deezer.com/track/4009477871",
        countries: ["FR"],
      },
      {
        name: "YouTube",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/youtube.svg",
        url: "https://www.youtube.com/watch?v=SJbC2i2MiBc",
        countries: [...REST_OF_WORLD_COUNTRIES],
        tracked: false,
      },
    ],
    genrePrimary: "afrobeat",
    label: "ERA Music",
    releaseDate: "2026-05-28",
    moodTags: ["popular", "party"],
    trackLanguage: "en",
  },
  {
    slug: "tayc-f-k-my-ex",
    artist: "Tayc",
    title: "F**k My Ex",
    releaseType: "Single",
    artworkUrl: "/artworks/tayc-f-k-my-ex.webp",
    ogTitle: "Tayc - F**k My Ex",
    ogDescription: "Listen to F**k My Ex by Tayc, out now on all platforms.",
    dsps: [
      {
        name: "Spotify",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/spotify.svg",
        url: "https://open.spotify.com/intl-fr/track/2P3zdt0B3iKZiPrwmDXSGB?si=31ff68525b97419a&utm_source=fanlinkhub&utm_medium=referral&utm_campaign=tayc-f-k-my-ex&utm_content=spotify",
      },
      {
        name: "Apple Music",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/applemusic.svg",
        url: "https://geo.music.apple.com/album/fuck-my-ex/1893043530?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=tayc-f-k-my-ex&utm_content=apple_music",
      },
    ],
    genrePrimary: "afrobeat",
    label: "PlayTwo",
    releaseDate: "2026-05-22",
    moodTags: ["party", "popular"],
    trackLanguage: "fr",
    shopUrl: "https://joya-univers.com",
  },
  {
    slug: "tayc-rnboi-maman-prie",
    artist: "Tayc, RnBoi",
    title: "Maman Prie",
    releaseType: "Single",
    artworkUrl: "/artworks/tayc-rnboi-maman-prie.webp",
    ogTitle: "Tayc, RnBoi - Maman Prie",
    ogDescription: "Listen to Maman Prie by Tayc, RnBoi, out now on all platforms.",
    dsps: [
      {
        name: "Spotify",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/spotify.svg",
        url: "https://open.spotify.com/intl-fr/track/6oojgcW5Ffo7GkB54vARCh?si=e693719429864a45&utm_source=fanlinkhub&utm_medium=referral&utm_campaign=tayc-rnboi-maman-prie&utm_content=spotify",
      },
      {
        name: "Apple Music",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/applemusic.svg",
        url: "https://geo.music.apple.com/album/maman-prie/1893043530?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=tayc-rnboi-maman-prie&utm_content=apple_music",
      },
    ],
    genrePrimary: "afrobeat",
    label: "Playtwo",
    releaseDate: "2026-05-15",
    moodTags: ["party", "popular"],
    trackLanguage: "fr",
    shopUrl: "https://joya-univers.com",
  },
  {
    slug: "odyssey-oh-la-mer",
    artist: "Odyssey",
    title: "Oh La Mer",
    releaseType: "Single",
    artworkUrl: "/artworks/olm.webp",
    ogTitle: "Odyssey - Oh La Mer",
    ogDescription: "Listen to Oh La Mer by Odyssey, out now on all platforms.",
    dsps: [
      {
        name: "Spotify",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/spotify.svg",
        url: "https://open.spotify.com/intl-fr/track/5se5BnFIsMf0CVTno42pq0?si=4308aae2e9c34c2c&utm_source=fanlinkhub&utm_medium=referral&utm_campaign=odyssey-oh-la-mer&utm_content=spotify",
      },
      {
        name: "Apple Music",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/applemusic.svg",
        url: "https://geo.music.apple.com/album/oh-la-mer/1895919957?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=odyssey-oh-la-mer&utm_content=apple_music",
      },
      {
        name: "Amazon Music",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/amazonmusic.svg",
        url: "https://music.amazon.com/tracks/B0GZ3SZH1S",
        excludeCountries: [...EUROPE_COUNTRIES],
      },
      {
        name: "Deezer",
        logo: "/icons/deezer.webp",
        url: "https://www.deezer.com/track/3994392731",
        countries: ["FR"],
      },
      {
        name: "YouTube",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/youtube.svg",
        url: "https://www.youtube.com/watch?v=FV4ZC_JrgYI",
        countries: [...REST_OF_WORLD_COUNTRIES],
        tracked: false,
      },
    ],
  },
  {
    slug: "sasson-jamy-nox-superstar",
    artist: "Sasson, Jamy Nox",
    title: "Superstar",
    releaseType: "Single",
    artworkUrl: "/artworks/maxresdefault-2.webp",
    ogTitle: "Sasson, Jamy Nox - Superstar",
    ogDescription: "Listen to Superstar by Sasson and Jamy Nox, out now on all platforms.",
    dsps: [
      {
        name: "Spotify",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/spotify.svg",
        url: "https://open.spotify.com/intl-fr/track/1yXke6pmnEMBrfSeYswRWR?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=sasson-jamy-nox-superstar&utm_content=spotify",
      },
      {
        name: "Apple Music",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/applemusic.svg",
        url: "https://geo.music.apple.com/album/superstar/1893973515?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=sasson-jamy-nox-superstar&utm_content=apple_music",
      },
      {
        name: "Amazon Music",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/amazonmusic.svg",
        url: "https://music.amazon.com/tracks/B0GXGCXS4Q",
        excludeCountries: [...EUROPE_COUNTRIES],
      },
      {
        name: "Deezer",
        logo: "/icons/deezer.webp",
        url: "https://www.deezer.com/track/3965170861",
        countries: ["FR"],
      },
      {
        name: "YouTube",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/youtube.svg",
        url: "https://www.youtube.com/watch?v=yWuT12y0FjM",
        countries: [...REST_OF_WORLD_COUNTRIES],
        tracked: false,
      },
      {
        name: "Beatport",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/beatport.svg",
        url: "https://www.beatport.com/fr/track/superstar/28526078",
        tracked: false,
      },
    ],
    genrePrimary: "dance",
    label: "Autre",
    releaseDate: "2026-05-08",
    moodTags: ["party", "drive"],
    trackLanguage: "en",
  },
  {
    slug: "elliott-on-s-oubliera",
    artist: "Elliott",
    title: "On S'oubliera",
    releaseType: "Single",
    artworkUrl: "/artworks/elliott-on-s-oubliera.webp",
    ogTitle: "Elliott - On S'oubliera",
    ogDescription: "Listen to On S'oubliera by Elliott, out now on all platforms.",
    dsps: [
      {
        name: "Spotify",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/spotify.svg",
        url: "https://open.spotify.com/intl-fr/track/6NaQWW8rAovNAsQSC5y5Zb?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=elliott-on-s-oubliera&utm_content=spotify",
      },
      {
        name: "Apple Music",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/applemusic.svg",
        url: "https://geo.music.apple.com/album/on-soubliera/1889891026?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=elliott-on-s-oubliera&utm_content=apple_music",
      },
    ],
    genrePrimary: "pop",
    label: "Autre",
    releaseDate: "2026-05-09",
    moodTags: ["chill", "late_night"],
    trackLanguage: "fr",
  },
  {
    slug: "alac-if-you-want-it",
    artist: "Alac",
    title: "If You Want It",
    releaseType: "Single",
    artworkUrl: "/artworks/alac-if-you-want-it.webp",
    ogTitle: "Alac - If You Want It",
    ogDescription: "Listen to If You Want It by Alac, out now on all platforms.",
    dsps: [
      {
        name: "Spotify",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/spotify.svg",
        url: "https://open.spotify.com/intl-fr/track/5eDMp5kLcoHZwtysE0jiEG?si=e2ba08bde2b34315&utm_source=fanlinkhub&utm_medium=referral&utm_campaign=alac-if-you-want-it&utm_content=spotify",
      },
      {
        name: "Apple Music",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/applemusic.svg",
        url: "https://geo.music.apple.com/album/if-you-want-it/1892503333?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=alac-if-you-want-it&utm_content=apple_music",
      },
    ],
    genrePrimary: "melodic_techno",
    label: "ERA Music",
    releaseDate: "2026-05-09",
    moodTags: ["running", "focus"],
    trackLanguage: "en",
  },
  {
    slug: "jey-vazz-you-know",
    artist: "Jey Vazz",
    title: "you know",
    releaseType: "Single",
    artworkUrl: "/artworks/jey-vazz-you-know.webp",
    ogTitle: "Jey Vazz - you know",
    ogDescription: "Listen to you know by Jey Vazz, out now on all platforms.",
    dsps: [
      {
        name: "Spotify",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/spotify.svg",
        url: "https://open.spotify.com/intl-fr/track/6JXowiCNuSWlF45WH81ODl?si=16432f1333e345c1&utm_source=fanlinkhub&utm_medium=referral&utm_campaign=jey-vazz-you-know&utm_content=spotify",
      },
      {
        name: "Apple Music",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/applemusic.svg",
        url: "https://geo.music.apple.com/album/you-know/1891987304?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=jey-vazz-you-know&utm_content=apple_music",
      },
    ],
    genrePrimary: "deep_house",
    label: "ERA Music",
    releaseDate: "2026-05-09",
    moodTags: ["running", "focus"],
    trackLanguage: "en",
  },
  {
    slug: "sensey-bandit-chef",
    artist: "SenSey'",
    title: "Bandit Chef",
    releaseType: "Single",
    artworkUrl: "/artworks/sensey-bandit-chef.webp",
    ogTitle: "SenSey' - Bandit Chef",
    ogDescription: "Listen to Bandit Chef by SenSey', out now on all platforms.",
    dsps: [
      {
        name: "Spotify",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/spotify.svg",
        url: "https://open.spotify.com/intl-fr/track/44A6TlpNKN3uuXfi2tdjnd?si=8f200382af3747c5&utm_source=fanlinkhub&utm_medium=referral&utm_campaign=sensey-bandit-chef&utm_content=spotify",
      },
      {
        name: "Apple Music",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/applemusic.svg",
        url: "https://geo.music.apple.com/album/bandit-chef/1887943995?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=sensey-bandit-chef&utm_content=apple_music",
      },
      {
        name: "Deezer",
        logo: "/icons/deezer.webp",
        url: "https://link.deezer.com/s/334CvKaxztiRUSJTRlxm0?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=sensey-bandit-chef&utm_content=deezer",
      },
    ],
  },
  {
    slug: "dreamstruck-shattered-dreams",
    artist: "Dreamstruck",
    title: "Shattered Dreams",
    releaseType: "Single",
    artworkUrl: "/artworks/dreamstruck-shattered-dreams.webp",
    ogTitle: "Dreamstruck - Shattered Dreams",
    ogDescription: "Listen to Shattered Dreams by Dreamstruck, out now on all platforms.",
    dsps: [
      {
        name: "Spotify",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/spotify.svg",
        url: "https://open.spotify.com/intl-fr/track/3ZeWbU8TVGXQ5K220qgdYK?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=dreamstruck-shattered-dreams&utm_content=spotify",
      },
      {
        name: "Apple Music",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/applemusic.svg",
        url: "https://geo.music.apple.com/album/shattered-dreams-edit/1769530938?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=dreamstruck-shattered-dreams&utm_content=apple_music",
      },
    ],
  },
  {
    slug: "tara-mcdonald-spaceman",
    artist: "Tara McDonald",
    title: "Spaceman",
    releaseType: "Single",
    artworkUrl: "/artworks/tara-mcdonald-spaceman.webp",
    ogTitle: "Tara McDonald - Spaceman",
    ogDescription: "Listen to Spaceman by Tara McDonald, out now on all platforms.",
    dsps: [
      {
        name: "Spotify",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/spotify.svg",
        url: "https://open.spotify.com/intl-fr/track/5LojXATHrueJw848BAtzMm?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=tara-mcdonald-spaceman&utm_content=spotify",
      },
      {
        name: "Apple Music",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/applemusic.svg",
        url: "https://geo.music.apple.com/album/youre-a-spaceman/1880366149?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=tara-mcdonald-spaceman&utm_content=apple_music",
      },
    ],
    genrePrimary: "dance",
    label: "ERA Music",
    releaseDate: "2026-05-09",
    moodTags: ["running", "sport"],
    trackLanguage: "en",
  },
  {
    slug: "smush-41",
    artist: "smush",
    title: "41",
    releaseType: "Single",
    artworkUrl: "/artworks/smush-41.webp",
    ogTitle: "smush – 41",
    ogDescription: "Listen to 41 by smush, out now on all platforms.",
    dsps: [
      {
        name: "Spotify",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/spotify.svg",
        url: "https://open.spotify.com/intl-fr/track/2UV0mn7uJoy8pTWpcrrR9p",
      },
      {
        name: "Apple Music",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/applemusic.svg",
        url: "https://geo.music.apple.com/album/41-single/1855633254",
      },
    ],
  },
  {
    slug: "tayc-girlfriend",
    artist: "Tayc",
    title: "Girlfriend",
    releaseType: "Single",
    artworkUrl: "/artworks/tayc-girlfriend.webp",
    ogTitle: "Tayc - Girlfriend",
    ogDescription: "Listen to Girlfriend by Tayc, out now on all platforms.",
    dsps: [
      {
        name: "Spotify",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/spotify.svg",
        url: "https://open.spotify.com/intl-fr/track/19jskaQ5MXGGMmaqQowfVS?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=tayc-girlfriend&utm_content=spotify",
      },
      {
        name: "Apple Music",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/applemusic.svg",
        url: "https://geo.music.apple.com/album/girlfriend/1886220508?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=tayc-girlfriend&utm_content=apple_music",
      },
    ],
    genrePrimary: "afrobeat",
    label: "Autre",
    releaseDate: "2026-05-09",
    moodTags: ["party", "sunset"],
    trackLanguage: "fr",
  },
];
