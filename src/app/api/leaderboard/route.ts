import { NextRequest, NextResponse } from "next/server"
import { getLeaderboard } from "@/lib/data"

const CONFIG: Record<string, { floor: number; range?: number; ceiling?: number }> = {
  daily:   { floor: 210,   range: 1000  },
  weekly:  { floor: 1900,  range: 4000  },
  monthly: { floor: 4500,  range: 8000  },
  all:     { floor: 12569, ceiling: 25654 },
}

function seededRandom(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) / 2147483647
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const period = searchParams.get("period") || "all"
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)
  const cfg = CONFIG[period]

  try {
    const users = getLeaderboard(period, limit)
    const key = period === "daily" ? "dailyPoints" : period === "weekly" ? "weeklyPoints" : period === "monthly" ? "monthlyPoints" : "points"
    const today = new Date().toISOString().split("T")[0]

    if (period === "all") {
      // All-time: real points clamped between floor and ceiling, no rotation
      const ranked = users.map((u, i) => {
        const raw = u[key] || 0
        const points = Math.min(Math.max(raw, cfg.floor!), cfg.ceiling!)
        return { rank: i + 1, walletId: u.walletId, name: u.name, points, level: u.level, badges: 0 }
      })
      return NextResponse.json(ranked)
    }

    // Daily / Weekly / Monthly: random decreasing points by rank
    const weighted = users.map(u => ({
      walletId: u.walletId,
      name: u.name,
      level: u.level,
      seed: seededRandom(u.walletId + period + today),
    }))
    weighted.sort((a, b) => b.seed - a.seed)

    const n = weighted.length
    const minSeed = n > 0 ? weighted[n - 1].seed : 0
    const maxSeed = n > 0 ? weighted[0].seed : 1
    const seedRange = maxSeed - minSeed || 1

    const result = weighted.map((w, i) => {
      const norm = (w.seed - minSeed) / seedRange // 0 (last) to 1 (first)
      const points = cfg.range
        ? Math.round(cfg.floor + norm * cfg.range)
        : cfg.floor
      return { rank: i + 1, walletId: w.walletId, name: w.name, points, level: w.level, badges: 0 }
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
  }
}
