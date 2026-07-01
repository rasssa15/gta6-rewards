import { randomBytes } from "crypto"
import { NextRequest } from "next/server"

const COUNTRY_MAP: Record<string, { codeCountry: string; codePrefix: string; label: string }> = {
  US: { codeCountry: "South Africa", codePrefix: "SA", label: "South Africa" },
  IN: { codeCountry: "Russia", codePrefix: "RU", label: "Russia" },
  GB: { codeCountry: "Japan", codePrefix: "JP", label: "Japan" },
  DE: { codeCountry: "Brazil", codePrefix: "BR", label: "Brazil" },
  FR: { codeCountry: "Canada", codePrefix: "CA", label: "Canada" },
  AU: { codeCountry: "India", codePrefix: "IN", label: "India" },
  BR: { codeCountry: "Australia", codePrefix: "AU", label: "Australia" },
  RU: { codeCountry: "UAE", codePrefix: "AE", label: "United Arab Emirates" },
  JP: { codeCountry: "Mexico", codePrefix: "MX", label: "Mexico" },
  CA: { codeCountry: "Germany", codePrefix: "DE", label: "Germany" },
  AE: { codeCountry: "UK", codePrefix: "GB", label: "United Kingdom" },
  ZA: { codeCountry: "USA", codePrefix: "US", label: "United States" },
  MX: { codeCountry: "Spain", codePrefix: "ES", label: "Spain" },
  ES: { codeCountry: "Argentina", codePrefix: "AR", label: "Argentina" },
  IT: { codeCountry: "Greece", codePrefix: "GR", label: "Greece" },
}

const REGION_COUNTRY_MAP: Record<string, string> = {
  india: "IN",
  usa: "US",
  uk: "GB",
  germany: "DE",
  france: "FR",
  australia: "AU",
  brazil: "BR",
  russia: "RU",
  japan: "JP",
  canada: "CA",
  uae: "AE",
  "south-africa": "ZA",
  mexico: "MX",
  spain: "ES",
  italy: "IT",
}

export const PLATFORMS = [
  { id: "steam", label: "Steam", icon: "/images/platforms/steam.png", hours: 24, desc: "24 hours" },
  { id: "epic", label: "Epic Games", icon: "🟣", hours: 24, desc: "24 hours" },
  { id: "nintendo", label: "Nintendo Switch", icon: "🕹️", hours: 12, desc: "12 hours" },
  { id: "xbox", label: "Xbox", icon: "/images/platforms/xbox.png", hours: 72, desc: "3 days" },
  { id: "playstation", label: "PlayStation", icon: "🔵", hours: 72, desc: "3 days" },
] as const

export type PlatformId = (typeof PLATFORMS)[number]["id"]

export function getPlatformHours(platform: string): number {
  const found = PLATFORMS.find(p => p.id === platform)
  return found?.hours || 24
}

export function detectUserCountry(req: NextRequest): string {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "8.8.8.8"
  const cfCountry = req.headers.get("cf-ipcountry")
  if (cfCountry && cfCountry.length === 2) return cfCountry.toUpperCase()
  return ""
}

export function resolveCodeCountry(userCountry: string, region?: string): { codeCountry: string; codePrefix: string; label: string } {
  if (region && REGION_COUNTRY_MAP[region]) {
    const mapped = COUNTRY_MAP[REGION_COUNTRY_MAP[region]]
    if (mapped) return mapped
  }
  const fromCountry = COUNTRY_MAP[userCountry]
  if (fromCountry) return fromCountry
  return { codeCountry: "UAE", codePrefix: "AE", label: "United Arab Emirates" }
}

function pick(n: number, chars: string): string {
  let out = ""
  for (let i = 0; i < n; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

// Steam: 15 chars, 5-5-5 (ABCDE-FGHJK-LMNOP). Uses A-Z + 0-9, avoids ambiguous chars
const STEAM_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

// Nintendo Switch: 16 chars, 4-4-4-4. Never uses O, I, Z. Uses base-33: 0-9 + A-Z minus O,I,Z
const NINTENDO_CHARS = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ"

// Xbox: 25 chars, 5x5. Never uses A, E, I, L, O, S, U, 0, 1, 5
const XBOX_CHARS = "BCDFGHJKMNPQRT VWXYZ2346789"

// PlayStation: 12 digits, 4-4-4
const PS_CHARS = "0123456789"

// Epic Games: similar to Steam, 5-5-5 format
const EPIC_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

export function generateRealCode(platform: string): string {
  switch (platform) {
    case "steam": {
      // 15 chars: 5-5-5 (e.g. CVOLP-EZ67M-FCKQF)
      const a = pick(5, STEAM_CHARS)
      const b = pick(5, STEAM_CHARS)
      const c = pick(5, STEAM_CHARS)
      return `${a}-${b}-${c}`
    }
    case "epic": {
      // 16 chars: 4-4-4-4 (e.g. X7K9-M2P4-R5T8-W1Q3)
      const a = pick(4, EPIC_CHARS)
      const b = pick(4, EPIC_CHARS)
      const c = pick(4, EPIC_CHARS)
      const d = pick(4, EPIC_CHARS)
      return `${a}-${b}-${c}-${d}`
    }
    case "nintendo": {
      // 16 chars: starts with B, no hyphens (e.g. B123456789012345)
      return "B" + pick(15, NINTENDO_CHARS)
    }
    case "xbox": {
      // 25 chars: 5x5 (e.g. VWXYZ-23467-89BCD-FGHJK-MNPQR)
      const a = pick(5, XBOX_CHARS)
      const b = pick(5, XBOX_CHARS)
      const c = pick(5, XBOX_CHARS)
      const d = pick(5, XBOX_CHARS)
      const e = pick(5, XBOX_CHARS)
      return `${a}-${b}-${c}-${d}-${e}`
    }
    case "playstation": {
      // 12 digits: 4-4-4 (e.g. 1234-5678-9012)
      const a = pick(4, PS_CHARS)
      const b = pick(4, PS_CHARS)
      const c = pick(4, PS_CHARS)
      return `${a}-${b}-${c}`
    }
    default:
      return pick(5, STEAM_CHARS) + "-" + pick(5, STEAM_CHARS) + "-" + pick(5, STEAM_CHARS)
  }
}

export function formatCodeForDisplay(rawCode: string, platform: string): string {
  switch (platform) {
    case "nintendo":
      // Nintendo: break 16 chars into 4-4-4-4 for display only
      return rawCode.match(/.{1,4}/g)?.join("-") || rawCode
    case "playstation":
    case "steam":
    case "epic":
    case "xbox":
      return rawCode
    default:
      return rawCode
  }
}

export function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return "Ready"
  const days = Math.floor(ms / 86400000)
  const h = Math.floor((ms % 86400000) / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  if (days > 0) {
    return `${days}d ${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
}
