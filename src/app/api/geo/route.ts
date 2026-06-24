import { NextRequest, NextResponse } from "next/server"

const CURRENCY_MAP: Record<string, { currency: string; symbol: string }> = {
  US: { currency: "USD", symbol: "$" },
  IN: { currency: "INR", symbol: "₹" },
  JP: { currency: "JPY", symbol: "¥" },
  CN: { currency: "CNY", symbol: "¥" },
  GB: { currency: "GBP", symbol: "£" },
  DE: { currency: "EUR", symbol: "€" },
  FR: { currency: "EUR", symbol: "€" },
  IT: { currency: "EUR", symbol: "€" },
  ES: { currency: "EUR", symbol: "€" },
  NL: { currency: "EUR", symbol: "€" },
  BE: { currency: "EUR", symbol: "€" },
  AT: { currency: "EUR", symbol: "€" },
  IE: { currency: "EUR", symbol: "€" },
  PT: { currency: "EUR", symbol: "€" },
  FI: { currency: "EUR", symbol: "€" },
  GR: { currency: "EUR", symbol: "€" },
  AU: { currency: "AUD", symbol: "A$" },
  CA: { currency: "CAD", symbol: "C$" },
}

const EUR_COUNTRIES = ["DE", "FR", "IT", "ES", "NL", "BE", "AT", "IE", "PT", "FI", "GR", "PL", "SE", "DK", "NO", "CZ", "RO", "HU"]

let cache = new Map<string, { currency: string; symbol: string; countryCode: string; country: string }>()

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "8.8.8.8"

  const cached = cache.get(ip)
  if (cached) return NextResponse.json(cached)

  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode,country,query`, {
      signal: AbortSignal.timeout(3000),
    })
    const data = await res.json()

    if (data.countryCode) {
      const cc = data.countryCode as string
      const mapped = CURRENCY_MAP[cc]
      const isEUR = EUR_COUNTRIES.includes(cc)

      const result = {
        currency: mapped?.currency || (isEUR ? "EUR" : "USD"),
        symbol: mapped?.symbol || (isEUR ? "€" : "$"),
        countryCode: cc,
        country: data.country || "Unknown",
      }

      cache.set(ip, result)
      if (cache.size > 1000) cache.clear()

      return NextResponse.json(result)
    }
  } catch {
    // fallback to USD
  }

  return NextResponse.json({ currency: "USD", symbol: "$", countryCode: "US", country: "United States" })
}
