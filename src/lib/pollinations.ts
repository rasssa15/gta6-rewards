const API_BASE = "https://gen.pollinations.ai"
const API_KEY = process.env.POLLINATIONS_API_KEY || ""

interface ImageOptions {
  prompt: string
  model?: string
  width?: number
  height?: number
  seed?: number
  quality?: number
  nologo?: boolean
}

interface VideoOptions {
  prompt: string
  model?: string
  duration?: number
  aspectRatio?: string
  seed?: number
  nologo?: boolean
}

export async function generateImage(opts: ImageOptions): Promise<ArrayBuffer> {
  const params = new URLSearchParams({
    model: opts.model || "p-image",
    width: String(opts.width || 384),
    height: String(opts.height || 384),
    nologo: opts.nologo !== false ? "true" : "false",
    ...(opts.seed != null ? { seed: String(opts.seed) } : {}),
    ...(opts.quality != null ? { quality: String(opts.quality) } : {}),
  })
  const url = `${API_BASE}/image/${encodeURIComponent(opts.prompt)}?${params}`
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      Accept: "image/jpeg, image/png, image/webp",
    },
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`Image generation failed: ${res.status} ${res.statusText}`)
  return res.arrayBuffer()
}

export async function generateVideo(opts: VideoOptions): Promise<ArrayBuffer> {
  const params = new URLSearchParams({
    model: opts.model || "seedance-2.0-mini",
    duration: String(opts.duration || 3),
    nologo: opts.nologo !== false ? "true" : "false",
    ...(opts.aspectRatio ? { aspectRatio: opts.aspectRatio } : {}),
    ...(opts.seed != null ? { seed: String(opts.seed) } : {}),
  })
  const url = `${API_BASE}/video/${encodeURIComponent(opts.prompt)}?${params}`
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      Accept: "video/mp4",
    },
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`Video generation failed: ${res.status} ${res.statusText}`)
  return res.arrayBuffer()
}

// Prompt library — GTA-themed prompts designed for reward card art
export const REWARD_PROMPTS: Record<string, string> = {
  "steam-coupon":
    "GTA 6 themed Steam gift card illustration, dark neon palette with pink and blue, game controller and steam logo motif, digital art, vibrant cyberpunk style, 384x384, centered composition",
  "playstation-coupon":
    "GTA 6 themed PlayStation gift card art, neon violet and blue glow, PS5 console silhouette, Vice City sunset background, sleek gaming aesthetic, 384x384, centered",
  "xbox-coupon":
    "GTA 6 themed Xbox gift card illustration, neon green and purple scheme, Xbox controller with GTA vibes, futuristic gaming art, 384x384, centered",
  "nintendo-coupon":
    "GTA 6 themed Nintendo eShop card art, neon red and pink tones, Switch console with Vice City flair, playful gaming illustration, 384x384, centered",
  "epic-coupon":
    "GTA 6 themed Epic Games Store card, neon cyan and magenta gradient, Epic logo with GTA 6 backdrop, sleek digital art, 384x384, centered",
  "gta6-preorder":
    "Grand Theft Auto VI pre-order card, Vice City neon skyline at night, pink and blue neon lights, palm trees, sports car, 384x384, centered, epic cinematic art, trending on artstation",
  "giftcard":
    "Generic GTA 6 gaming gift card, neon triangle gradient background, gaming loot concept, vibrant purple and pink, 384x384, centered",
  "bronze-tier":
    "Bronze tier GTA 6 reward card, dark copper and bronze tones, subtle neon accents, minimalist gaming trophy design, 384x384, centered",
  "silver-tier":
    "Silver tier GTA 6 reward card, sleek metallic silver with neon blue accents, premium gaming award aesthetic, 384x384, centered",
  "gold-tier":
    "Gold tier GTA 6 legendary reward card, glowing gold and neon orange, crown motif, premium luxury gaming art, 384x384, centered",
  "wallpaper-pack":
    "GTA 6 wallpaper pack artwork, collage of Vice City scenes, neon palm trees, sports cars, ocean sunset, vibrant digital art, 384x384, centered",
  "theme-pack":
    "GTA 6 neon theme pack artwork, abstract neon pink and blue waves, cyberpunk UI elements, dark background with glowing gradients, 384x384, centered",
}

export const ANIMATION_PROMPTS = {
  crateOpen:
    "GTA 6 neon crate opening animation frame, dark purple glow, pink neon particles, treasure chest with Vice City style, high contrast, game asset style",
  boxGlow:
    "GTA 6 reward box glowing with neon pink and blue energy, dark background, ethereal light rays, cyberpunk aesthetic, 512x512",
  particleBg:
    "GTA 6 neon particles floating in dark space, pink blue purple orbs, bokeh effect, cyberpunk night club atmosphere, 1920x1080",
  confetti:
    "GTA 6 celebration confetti, neon pink gold and blue particles, festive gaming celebration, dark background, 512x512",
}

export const VIDEO_PROMPTS = {
  rewardReveal:
    "GTA 6 reward reveal animation, neon pink box opening with energy burst, Vice City style particles, smooth cinematic motion, high contrast neon gaming aesthetic",
  crateExplosion:
    "GTA 6 premium crate explosion, neon purple and pink energy burst, cards flying outward, dark background, smooth slow motion, gaming loot box opening",
}
