import { writeFileSync, mkdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, "..", "public", "images", "wallpapers")
mkdirSync(OUT, { recursive: true })

const W = 1920, H = 1080

const PALETTES = [
  ["#ff0066", "#00ccff", "#1a0533"], // Vice City neon
  ["#ff6b35", "#f7c59f", "#004e89"], // Miami sunset
  ["#e63946", "#457b9d", "#1d3557"], // Retro red/blue
  ["#06d6a0", "#118ab2", "#073b4c"], // Tropical teal
  ["#ffd166", "#ef476f", "#26547c"], // Synthwave
  ["#7b2cbf", "#c77dff", "#10002b"], // Deep purple
  ["#f4a261", "#e76f51", "#264653"], // Desert sunset
  ["#00b4d8", "#0077b6", "#03045e"], // Ocean blue
  ["#ff577f", "#ff884b", "#352f44"], // Rose gold
  ["#80ffdb", "#64dfdf", "#6930c3"], // Cyberpunk
  ["#ff9f1c", "#ffbf69", "#2ec4b6"], // Tropical
  ["#e0aaff", "#c77dff", "#3c096c"], // Lavender neon
  ["#f72585", "#b5179e", "#3a0ca3"], // Hot pink
  ["#4cc9f0", "#4895ef", "#4361ee"], // Electric blue
  ["#ffd60a", "#ffc300", "#003566"], // Gold & navy
  ["#ff6b6b", "#c0392b", "#2d1b1b"], // Crimson
  ["#38b000", "#008000", "#003d00"], // Night vision
  ["#ff8700", "#ff5e00", "#2d1600"], // Amber
  ["#00f5d4", "#00bbf9", "#03045e"], // Aqua neon
  ["#f15bb5", "#fee440", "#00bbf9"], // 80s arcade
]

const SKYLINE_TEMPLATES = [
  (i) => `<rect x="${100+i*80}" y="${400-i*15}" width="60" height="${680+i*15}" rx="3"/>`,
  (i) => `<rect x="${100+i*80}" y="${200+i*20}" width="60" height="${880-i*20}" rx="3"/>`,
  (i) => `<rect x="${i*85}" y="${300+Math.sin(i)*200}" width="70" height="${780-Math.sin(i)*200}" rx="4"/>`,
]

function randomCitySkyline(maxBuildings = 18) {
  const tpl = SKYLINE_TEMPLATES[Math.floor(Math.random() * SKYLINE_TEMPLATES.length)]
  let svg = ""
  for (let i = 0; i < maxBuildings; i++) {
    svg += tpl(i) + "\n"
  }
  return svg
}

function generateWallpaper(seed, palette) {
  const rng = mulberry32(seed)
  const rand = () => rng() / 0xffffffff
  const c1 = palette[0], c2 = palette[1], c3 = palette[2]

  const designType = Math.floor(rand() * 8)

  const bgGrad = `url(#bg${seed})`
  const accentGrad = `url(#accent${seed})`

  let content = ""

  // Background gradient
  content += `<defs>
    <linearGradient id="bg${seed}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${c3}"/>
      <stop offset="50%" stop-color="${darken(c3, 20)}"/>
      <stop offset="100%" stop-color="${c3}"/>
    </linearGradient>
    <linearGradient id="sun${seed}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
    <radialGradient id="glow${seed}" cx="50%" cy="70%" r="50%">
      <stop offset="0%" stop-color="${c1}" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="${c3}" stop-opacity="0"/>
    </radialGradient>
  </defs>`

  // Base rect
  content += `<rect width="${W}" height="${H}" fill="${bgGrad}"/>`

  // Glow
  const glowX = 300 + rand() * 1200
  const glowY = 200 + rand() * 400
  content += `<circle cx="${glowX}" cy="${glowY}" r="${600 + rand() * 300}" fill="${c1}" opacity="${0.05 + rand() * 0.1}"/>`
  content += `<circle cx="${glowX + 200}" cy="${glowY - 100}" r="${400 + rand() * 200}" fill="${c2}" opacity="${0.05 + rand() * 0.08}"/>`

  // Grid lines (synthwave feel)
  if (designType < 3) {
    for (let i = 0; i < 20; i++) {
      const y = H - 100 - i * 45
      content += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${c2}" stroke-opacity="${0.03 + 0.02 * (1 - i/20)}" stroke-width="${i === 0 ? 2 : 0.5}"/>`
    }
    // Perspective lines
    for (let i = -5; i <= 5; i++) {
      const x = W/2 + i * 80
      const yOff = 50 + Math.abs(i) * 10
      content += `<line x1="${x}" y1="${H}" x2="${W/2 + i * 20}" y2="${H - 400 - yOff}" stroke="${c1}" stroke-opacity="${0.04}" stroke-width="${1}"/>`
    }
  }

  // Sun/moon
  const sunSize = 60 + rand() * 40
  const sunX = 300 + rand() * 1200
  const sunY = 150 + rand() * 300
  content += `<circle cx="${sunX}" cy="${sunY}" r="${sunSize}" fill="url(#sun${seed})" opacity="${0.6 + rand() * 0.3}"/>`
  content += `<circle cx="${sunX}" cy="${sunY}" r="${sunSize - 5}" fill="${c3}" opacity="0.3"/>`

  // Horizontal scanlines
  if (rand() > 0.5) {
    content += `<pattern id="scan${seed}" width="${W}" height="4" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="${W}" y2="0" stroke="#000" stroke-opacity="0.05" stroke-width="1"/>
    </pattern>
    <rect width="${W}" height="${H}" fill="url(#scan${seed})"/>`
  }

  // Stars
  if (designType < 4) {
    const starCount = 30 + Math.floor(rand() * 60)
    for (let i = 0; i < starCount; i++) {
      const sx = rand() * W
      const sy = rand() * (H * 0.4)
      const sr = 0.5 + rand() * 1.5
      const sop = 0.2 + rand() * 0.6
      content += `<circle cx="${sx}" cy="${sy}" r="${sr}" fill="#fff" opacity="${sop}"/>`
    }
  }

  // City skyline
  if (designType < 6) {
    const buildingCount = 15 + Math.floor(rand() * 10)
    const baseY = H - 100 - rand() * 150
    for (let i = 0; i < buildingCount; i++) {
      const bx = (i / buildingCount) * W + rand() * 30
      const bw = 30 + rand() * 60
      const bh = 80 + rand() * 300
      const by = baseY - bh
      const bc = rand() > 0.5 ? c3 : darken(c3, 10)
      const bo = 0.4 + rand() * 0.3
      content += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="${bc}" opacity="${bo}" rx="2"/>`
      // Window lights
      const windows = 3 + Math.floor(rand() * 6)
      for (let w = 0; w < windows; w++) {
        const wy = by + 10 + w * (bh / windows)
        const ww = 4 + rand() * 8
        const wh = 6 + rand() * 4
        const wo = 0.1 + rand() * 0.5
        content += `<rect x="${bx + bw/2 - ww/2}" y="${wy}" width="${ww}" height="${wh}" fill="${c2}" opacity="${wo}" rx="1"/>`
        content += `<rect x="${bx + bw/4 - ww/2}" y="${wy + wh/2}" width="${ww}" height="${wh}" fill="${c1}" opacity="${wo * 0.5}" rx="1"/>`
      }
    }
  }

  // Palm trees (Vice City style)
  if (designType >= 2 && designType < 7) {
    const palmCount = 2 + Math.floor(rand() * 4)
    for (let p = 0; p < palmCount; p++) {
      const px = rand() * W
      const py = H - 100 - rand() * 200
      const trunkH = 100 + rand() * 150
      const lean = -20 + rand() * 40
      content += `<path d="M${px} ${py} Q${px + lean} ${py - trunkH/2} ${px + lean * 1.2} ${py - trunkH}" stroke="${darken(c3, 30)}" stroke-width="${4 + rand() * 4}" fill="none" stroke-linecap="round"/>`
      // Palm fronds
      for (let f = 0; f < 5 + Math.floor(rand() * 3); f++) {
        const angle = (f / 7) * Math.PI * 2
        const len = 30 + rand() * 50
        const fx = px + lean * 1.2 + Math.cos(angle) * len
        const fy = py - trunkH + Math.sin(angle) * len * 0.3
        content += `<path d="M${px + lean * 1.2} ${py - trunkH} Q${(px + lean * 1.2 + fx)/2 + rand() * 20} ${(py - trunkH + fy)/2 - 20} ${fx} ${fy}" stroke="${darken(c3, 20)}" stroke-width="${2 + rand() * 2}" fill="none" stroke-linecap="round" opacity="0.6"/>`
      }
    }
  }

  // Neon grid (Tron/cyberpunk style)
  if (designType >= 6) {
    const gridSize = 40 + Math.floor(rand() * 40)
    const gridOpacity = 0.03 + rand() * 0.04
    for (let x = 0; x < W; x += gridSize) {
      content += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${c1}" stroke-opacity="${gridOpacity}" stroke-width="0.5"/>`
    }
    for (let y = 0; y < H; y += gridSize) {
      content += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${c1}" stroke-opacity="${gridOpacity}" stroke-width="0.5"/>`
    }
  }

  // Ground
  content += `<rect x="0" y="${H - 80}" width="${W}" height="80" fill="${darken(c3, 15)}" opacity="0.8"/>`
  // Highway line
  content += `<line x1="0" y1="${H - 40}" x2="${W}" y2="${H - 40}" stroke="${c2}" stroke-opacity="0.15" stroke-width="2" stroke-dasharray="30,20"/>`

  // Bottom fade
  content += `<rect x="0" y="${H - 150}" width="${W}" height="150" fill="url(#glow${seed})"/>`

  // Water reflection
  if (rand() > 0.5) {
    content += `<rect x="0" y="${H - 100}" width="${W}" height="100" fill="${c2}" opacity="0.04"/>`
    for (let i = 0; i < 30; i++) {
      const rx = rand() * W
      const rw = 20 + rand() * 100
      const ro = 0.02 + rand() * 0.04
      content += `<rect x="${rx}" y="${H - 80 + rand() * 60}" width="${rw}" height="2" fill="${c1}" opacity="${ro}" rx="1"/>`
    }
  }

  // GTA watermark
  content += `<text x="${W - 20}" y="${H - 20}" font-family="Arial, sans-serif" font-size="11" fill="#fff" opacity="0.08" text-anchor="end" letter-spacing="2">GTA 6 REWARDS · WALLPAPER ${String(seed + 1).padStart(3, "0")}</text>`

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
${content}
</svg>`
}

function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5
    t = Math.imul(t ^ t >>> 15, t | 1)
    t ^= t + Math.imul(t ^ t >>> 7, t | 61)
    return ((t ^ t >>> 14) >>> 0)
  }
}

function darken(hex, percent) {
  const num = parseInt(hex.replace("#", ""), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.max(0, (num >> 16) - amt)
  const G = Math.max(0, (num >> 8 & 0x00FF) - amt)
  const B = Math.max(0, (num & 0x0000FF) - amt)
  return "#" + (1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)
}

for (let i = 0; i < 100; i++) {
  const palette = PALETTES[i % PALETTES.length]
  const svg = generateWallpaper(i, palette)
  const idx = String(i + 1).padStart(3, "0")
  writeFileSync(join(OUT, `wallpaper-${idx}.svg`), svg, "utf-8")
}

console.log("Generated 100 wallpapers in", OUT)
