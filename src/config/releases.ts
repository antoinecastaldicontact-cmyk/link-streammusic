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
        logo: "https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_Green.png",
        url: "https://open.spotify.com/track/REPLACE_WITH_REAL_ID",
      },
      {
        name: "Apple Music",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Apple_Music_icon.svg/1024px-Apple_Music_icon.svg.png",
        url: "https://music.apple.com/REPLACE",
      },
      {
        name: "Deezer",
        logo: "https://e-cdns-files.dzcdn.net/cache/images/common/header/logo-deezer-white.svg",
        url: "https://www.deezer.com/track/REPLACE",
      },
    ],
  },
];
