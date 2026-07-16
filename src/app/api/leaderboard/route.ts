import { NextRequest, NextResponse } from "next/server"
import { getUsers } from "@/lib/data"

export const dynamic = "force-dynamic"

async function getRealUsers(period: string, limit: number) {
  try {
    const { prisma } = await import("@/lib/prisma")

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    weekStart.setHours(0, 0, 0, 0)

    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    const users = await prisma.user.findMany({
      where: {},
      select: { id: true, walletId: true, name: true, points: true, level: true, createdAt: true },
    })

    const results = []
    for (const u of users) {
      let periodPoints = 0
      let dateFilter = {}

      if (period === "daily") {
        dateFilter = { createdAt: { gte: todayStart } }
      } else if (period === "weekly") {
        dateFilter = { createdAt: { gte: weekStart } }
      } else if (period === "monthly") {
        dateFilter = { createdAt: { gte: monthStart } }
      }

      if (period === "all") {
        periodPoints = u.points || 0
      } else {
        const agg = await prisma.pointTransaction.aggregate({
          where: { userId: u.id, amount: { gt: 0 }, ...dateFilter },
          _sum: { amount: true },
        })
        periodPoints = agg._sum.amount || 0
      }

      if (periodPoints > 0) {
        results.push({
          rank: 0,
          walletId: u.walletId,
          name: u.name || "Player",
          points: periodPoints,
          allTimePoints: u.points || 0,
          level: u.level || 1,
          badges: 0,
          isRealUser: true,
        })
      }
    }

    return results.sort((a, b) => b.points - a.points).slice(0, limit)
  } catch {
    return []
  }
}

function sortByPeriod(users: any[], period: string) {
  return [...users].sort((a, b) => {
    let pa, pb
    if (period === "daily") { pa = a.dailyPoints || 0; pb = b.dailyPoints || 0 }
    else if (period === "weekly") { pa = a.weeklyPoints || 0; pb = b.weeklyPoints || 0 }
    else if (period === "monthly") { pa = a.monthlyPoints || 0; pb = b.monthlyPoints || 0 }
    else { pa = a.points || 0; pb = b.points || 0 }
    return pb - pa
  })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const period = searchParams.get("period") || "all"
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)

  try {
    const { users: simUsers } = getUsers({ limit: 500, offset: 0 })

    const sortedSim = sortByPeriod(simUsers, period).slice(0, limit).map((u, i) => ({
      rank: i + 1,
      walletId: u.walletId,
      name: u.name,
      points: period === "daily" ? u.dailyPoints : period === "weekly" ? u.weeklyPoints : period === "monthly" ? u.monthlyPoints : u.points,
      allTimePoints: u.points,
      level: u.level || 1,
      badges: 0,
      isRealUser: false,
    }))

    const realUsers = await getRealUsers(period, limit)

    const merged = [...realUsers, ...sortedSim]
      .sort((a, b) => b.points - a.points)

    const seen = new Set()
    const deduped = []
    for (const u of merged) {
      if (!seen.has(u.walletId)) {
        seen.add(u.walletId)
        deduped.push(u)
      }
    }

    const result = deduped.slice(0, limit).map((u, i) => ({
      ...u,
      rank: i + 1,
    }))

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
  }
}
