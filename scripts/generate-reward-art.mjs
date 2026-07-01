/**
 * Generate GTA 6 reward images using Pollinations public API (free, no key needed).
 * p-image model: free, fast, good quality for reward cards.
 * 
 * Run: node scripts/generate-reward-art.mjs
 */

const API_BASE = "https://image.pollinations.ai"

const ITEMS = [
  // --- Reward Card Images (384x384) ---
  { name: "steam-coupon", prompt: "GTA 6 Steam gift card, neon pink blue, game controller with steam logo, dark cyberpunk, 384x384", w: 384, h: 384, seed: 42 },
  { name: "playstation-coupon", prompt: "GTA 6 PlayStation gift card, neon violet blue, PS5 silhouette, Vice City sunset, 384x384", w: 384, h: 384, seed: 43 },
  { name: "xbox-coupon", prompt: "GTA 6 Xbox gift card, neon green purple, Xbox controller, futuristic gaming, 384x384", w: 384, h: 384, seed: 44 },
  { name: "nintendo-coupon", prompt: "GTA 6 Nintendo eShop card, neon red pink, Switch console, Vice City, 384x384", w: 384, h: 384, seed: 45 },
  { name: "epic-coupon", prompt: "GTA 6 Epic Games Store card, neon cyan magenta, Epic logo, dark cyberpunk, 384x384", w: 384, h: 384, seed: 46 },
  { name: "gta6-preorder", prompt: "Grand Theft Auto VI pre-order card, Vice City neon skyline night, pink blue neon lights, palm trees sports car, epic cinematic", w: 512, h: 512, seed: 47 },
  { name: "giftcard", prompt: "GTA 6 gaming gift card, neon triangle gradient, vibrant purple pink gaming loot, 384x384", w: 384, h: 384, seed: 48 },
  { name: "bronze-tier", prompt: "Bronze tier GTA 6 reward card, dark copper bronze, subtle neon accents, gaming trophy, 384x384", w: 384, h: 384, seed: 49 },
  { name: "silver-tier", prompt: "Silver tier GTA 6 reward card, metallic silver neon blue, premium gaming award, 384x384", w: 384, h: 384, seed: 50 },
  { name: "gold-tier", prompt: "Gold tier GTA 6 legendary reward, glowing gold neon orange, crown motif, luxury gaming, 384x384", w: 384, h: 384, seed: 51 },
  { name: "wallpaper-pack", prompt: "GTA 6 wallpaper pack art, collage Vice City scenes, neon palm trees sports cars ocean sunset, 512x512", w: 512, h: 512, seed: 52 },
  { name: "theme-pack", prompt: "GTA 6 neon theme pack, abstract neon pink blue waves, cyberpunk UI, dark bg glowing, 384x384", w: 384, h: 384, seed: 53 },
  // --- Animation Backgrounds ---
  { name: "particle-bg", prompt: "GTA 6 neon particles floating dark space, pink blue purple orbs, bokeh, cyberpunk night club, 1920x1080", w: 1920, h: 1080, seed: 100 },
  { name: "crate-glow", prompt: "GTA 6 neon reward crate, dark purple glow, pink neon energy, treasure chest Vice City, 512x512", w: 512, h: 512, seed: 101 },
  { name: "confetti-burst", prompt: "GTA 6 celebration confetti burst, neon pink gold blue particles, festive gaming, dark bg, 1024x768", w: 1024, h: 768, seed: 102 },
  // --- Reward Box Textures ---
  { name: "box-common", prompt: "GTA 6 common reward box, dark gray metallic, subtle neon, game loot crate, 256x256", w: 256, h: 256, seed: 60 },
  { name: "box-uncommon", prompt: "GTA 6 uncommon reward box, green neon glow, sleek gaming crate, 256x256", w: 256, h: 256, seed: 61 },
  { name: "box-rare", prompt: "GTA 6 rare reward box, blue neon energy, premium loot crate, 256x256", w: 256, h: 256, seed: 62 },
  { name: "box-epic", prompt: "GTA 6 epic reward box, purple neon glow, legendary loot crate, 256x256", w: 256, h: 256, seed: 63 },
  { name: "box-legendary", prompt: "GTA 6 legendary reward box, gold neon glow, ultimate loot crate, 256x256", w: 256, h: 256, seed: 64 },
]

async function generate(item) {
  const params = new URLSearchParams({
    model: "p-image",
    width: String(item.w),
    height: String(item.h),
    nologo: "true",
    seed: String(item.seed),
  })
  const url = `${API_BASE}/prompt/${encodeURIComponent(item.prompt)}?${params}`
  const filePath = `public/images${item.name.startsWith("box-") ? "/animations" : item.name.endsWith("-bg") || item.name.endsWith("-glow") || item.name.endsWith("-burst") ? "/animations" : "/rewards"}/${item.name}.webp`

  process.stdout.write(`  ${item.name}.webp... `)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  const buffer = Buffer.from(await res.arrayBuffer())
  const fs = await import("fs/promises")
  const path = await import("path")
  const fullPath = path.join(process.cwd(), filePath)
  await fs.mkdir(path.dirname(fullPath), { recursive: true })
  await fs.writeFile(fullPath, buffer)
  console.log(`✓ ${(buffer.length / 1024).toFixed(0)} KB`)
}

async function main() {
  console.log("=== GTA 6 Reward Art Generator ===\n")
  console.log("Using Pollinations public API (p-image, free)\n")
  console.log(`Total items: ${ITEMS.length}\n`)

  let ok = 0, fail = 0
  for (const item of ITEMS) {
    try {
      await generate(item)
      ok++
    } catch (e) {
      console.log(`✗ ${e.message}`)
      fail++
    }
  }

  console.log(`\n=== Done: ${ok} succeeded, ${fail} failed ===`)

  if (fail > 0) {
    console.log("\nNote: Your API key (cfut_...) didn't authenticate with gen.pollinations.ai,")
    console.log("so paid models (gpt-image-2, seedance) couldn't be used.")
    console.log("All images use the free p-image model via the public API.")
    console.log("Check the key at https://enter.pollinations.ai if you need paid models/video.")
  }
}

main().catch(e => { console.error("\nFatal:", e); process.exit(1) })
