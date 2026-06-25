import { NextRequest, NextResponse } from "next/server"
import { getLeaderboard } from "@/lib/data"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const period = searchParams.get("period") || "all"
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)

  try {
    const users = getLeaderboard(period, limit)
    const key = period === "daily" ? "dailyPoints" : period === "weekly" ? "weeklyPoints" : period === "monthly" ? "monthlyPoints" : "points"
    const ranked = users.map((u, i) => ({
      rank: i + 1,
      walletId: u.walletId,
      name: u.name,
      points: u[key],
      level: u.level,
      badges: 0,
    }))
    return NextResponse.json(ranked)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
  }
}
