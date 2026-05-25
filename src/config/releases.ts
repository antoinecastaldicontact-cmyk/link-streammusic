export interface DSP {
  name: string;
  logo: string;
  url: string;
  /** When false, click is not sent to Meta CAPI / pixel. Defaults to true. */
  tracked?: boolean;
}

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
