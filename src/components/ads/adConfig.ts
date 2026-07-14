export type AdType =
  | "responsive"
  | "skyscraper"
  | "medium-rectangle"
  | "leaderboard"
  | "banner-320x50"
  | "banner-160x300"
  | "banner-468x60"

export interface AdConfigEntry {
  key: string
  containerId: string
  script: string
  height: number
  width: number
}

export const AD_CONFIG: Record<AdType, AdConfigEntry> = {
  responsive: {
    key: "f301214e059ca70b56b447bf6850594e",
    containerId: "container-f301214e059ca70b56b447bf6850594e",
    script: "https://evidentbummerhike.com/f301214e059ca70b56b447bf6850594e/invoke.js",
    height: 280,
    width: 300,
  },
  skyscraper: {
    key: "14c436bda0b1d02724d0618980143ce5",
    containerId: "container-14c436bda0b1d02724d0618980143ce5",
    script: "https://evidentbummerhike.com/14c436bda0b1d02724d0618980143ce5/invoke.js",
    height: 600,
    width: 160,
  },
  "medium-rectangle": {
    key: "bec02ef6fdbfe5fe80e15c3c4f9f4b58",
    containerId: "container-bec02ef6fdbfe5fe80e15c3c4f9f4b58",
    script: "https://evidentbummerhike.com/bec02ef6fdbfe5fe80e15c3c4f9f4b58/invoke.js",
    height: 250,
    width: 300,
  },
  leaderboard: {
    key: "7e7419c72404cab7787c27dfdac31321",
    containerId: "container-7e7419c72404cab7787c27dfdac31321",
    script: "https://evidentbummerhike.com/7e7419c72404cab7787c27dfdac31321/invoke.js",
    height: 90,
    width: 728,
  },
  "banner-320x50": {
    key: "a32d05859c7cdc4b19c45ea2746367ad",
    containerId: "container-a32d05859c7cdc4b19c45ea2746367ad",
    script: "https://evidentbummerhike.com/a32d05859c7cdc4b19c45ea2746367ad/invoke.js",
    height: 50,
    width: 320,
  },
  "banner-160x300": {
    key: "0eda691a40adbc5636d43af20fdda82d",
    containerId: "container-0eda691a40adbc5636d43af20fdda82d",
    script: "https://evidentbummerhike.com/0eda691a40adbc5636d43af20fdda82d/invoke.js",
    height: 300,
    width: 160,
  },
  "banner-468x60": {
    key: "ab7ca47a4d4e9c1d01cb3978051a9800",
    containerId: "container-ab7ca47a4d4e9c1d01cb3978051a9800",
    script: "https://evidentbummerhike.com/ab7ca47a4d4e9c1d01cb3978051a9800/invoke.js",
    height: 60,
    width: 468,
  },
}
