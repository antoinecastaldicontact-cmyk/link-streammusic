export interface DSP {
  name: string;
  logo: string;
  url: string;
}

export interface ReleaseConfig {
  slug: string;
  artist: string;
  title: string;
  releaseType: "Single" | "EP" | "Album";
  artworkUrl: string;
  ogTitle: string;
  ogDescription: string;
  dsps: DSP[];
}

export const releases: ReleaseConfig[] = [
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
        url: "https://music.apple.com/fr/album/on-soubliera/1889891026?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=elliott-on-s-oubliera&utm_content=apple_music",
      },
    ],
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
        url: "https://music.apple.com/fr/album/if-you-want-it/1892503333?i=1892503347&utm_source=fanlinkhub&utm_medium=referral&utm_campaign=alac-if-you-want-it&utm_content=apple_music",
      },
    ],
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
        url: "https://music.apple.com/fr/album/you-know/1891987304?i=6761902083&utm_source=fanlinkhub&utm_medium=referral&utm_campaign=jey-vazz-you-know&utm_content=apple_music",
      },
    ],
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
        url: "https://music.apple.com/fr/album/bandit-chef/1887943995?i=1887944238&utm_source=fanlinkhub&utm_medium=referral&utm_campaign=sensey-bandit-chef&utm_content=apple_music",
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
        url: "https://music.apple.com/fr/album/shattered-dreams-edit/1769530938?i=1769531282&utm_source=fanlinkhub&utm_medium=referral&utm_campaign=dreamstruck-shattered-dreams&utm_content=apple_music",
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
        url: "https://music.apple.com/fr/album/youre-a-spaceman/1880366149?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=tara-mcdonald-spaceman&utm_content=apple_music",
      },
    ],
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
        url: "https://music.apple.com/fr/album/41-single/1855633254",
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
        url: "https://music.apple.com/fr/album/girlfriend/1886220508?utm_source=fanlinkhub&utm_medium=referral&utm_campaign=tayc-girlfriend&utm_content=apple_music",
      },
    ],
  },
];
