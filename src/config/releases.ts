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
    slug: "tayc-girlfriend",
    artist: "Tayc",
    title: "Girlfriend",
    releaseType: "Single",
    artworkUrl: "/artworks/tayc-girlfriend.webp",
    ogTitle: "Tayc – Girlfriend",
    ogDescription: "Listen to Girlfriend by Tayc, out now on all platforms.",
    dsps: [
      {
        name: "Spotify",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/spotify.svg",
        url: "REPLACE_URL",
      },
      {
        name: "Apple Music",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/applemusic.svg",
        url: "REPLACE_URL",
      },
      {
        name: "Deezer",
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/deezer.svg",
        url: "https://link.deezer.com/s/330vl0ZpyTzlCpYchPdzy",
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
        logo: "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/deezer.svg",
        url: "https://www.deezer.com/track/REPLACE",
      },
    ],
  },
];
