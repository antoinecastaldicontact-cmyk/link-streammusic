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
  {
    slug: "poylow-example-track",
    artist: "Poylow",
    title: "Example Track",
    releaseType: "Single",
    artworkUrl: "/artworks/poylow-example-track.jpg",
    ogTitle: "Poylow – Example Track",
    ogDescription: "Listen to Example Track by Poylow, out now on all platforms.",
    dsps: [
      {
        name: "Spotify",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/spotify.svg",
        url: "https://open.spotify.com/track/REPLACE_WITH_REAL_ID",
      },
      {
        name: "Apple Music",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/applemusic.svg",
        url: "https://music.apple.com/REPLACE",
      },
      {
        name: "Deezer",
        logo: "/icons/deezer.webp",
        url: "https://www.deezer.com/track/REPLACE",
      },
    ],
  },
];
