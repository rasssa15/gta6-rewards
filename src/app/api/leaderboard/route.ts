import { NextRequest, NextResponse } from "next/server"
import { getLeaderboard } from "@/lib/data"

const CONFIG: Record<string, { floor: number; range?: number; ceiling?: number }> = {
  daily:   { floor: 210,   range: 1000  },
  weekly:  { floor: 1900,  range: 4000  },
  monthly: { floor: 4500,  range: 8000  },
  all:     { floor: 0,     ceiling: 0   },
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

  try {
    const fakeUsers = getLeaderboard(period, 500)
    const key = period === "daily" ? "dailyPoints" : period === "weekly" ? "weeklyPoints" : period === "monthly" ? "monthlyPoints" : "points"

    // Fetch real users from DB
    let realUsers: any[] = []
    try {
      const { prisma } = await import("@/lib/prisma")
      realUsers = await prisma.user.findMany({
        where: { points: { gt: 0 } },
        select: { walletId: true, name: true, points: true, level: true },
        orderBy: { points: "desc" },
        take: limit,
      })
    } catch {}

    // Merge: combine fake + real, sort by points desc, deduplicate by walletId
    const allUsers = [...fakeUsers.map(u => ({ ...u, _real: false })), ...realUsers.map(u => ({ ...u, _real: true }))]
    const seen = new Set<string>()
    const merged = allUsers
      .sort((a, b) => (b.points || 0) - (a.points || 0))
      .filter(u => {
        if (seen.has(u.walletId)) return false
        seen.add(u.walletId)
        return true
      })
      .slice(0, limit)

    if (period === "all") {
      // All-time: show real points with no cap, real users replace fake ones by rank
      const ranked = merged.map((u, i) => ({
        rank: i + 1,
        walletId: u.walletId,
        name: u.name || "Player",
        points: Math.max(u.points || 0, 0),
        level: u.level || 1,
        badges: 0,
      }))
      return NextResponse.json(ranked)
    }

    // Daily / Weekly / Monthly: random decreasing points by rank
    const today = new Date().toISOString().split("T")[0]
    const weighted = merged.map(u => ({
      walletId: u.walletId,
      name: u.name || "Player",
      level: u.level || 1,
      seed: seededRandom(u.walletId + period + today),
    }))
    weighted.sort((a, b) => b.seed - a.seed)

    const n = weighted.length
    const minSeed = n > 0 ? weighted[n - 1].seed : 0
    const maxSeed = n > 0 ? weighted[0].seed : 1
    const seedRange = maxSeed - minSeed || 1

    const result = weighted.map((w, i) => {
      const norm = (w.seed - minSeed) / seedRange
      const cfg = CONFIG[period]
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
