import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const period = searchParams.get("period") || "all"
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)

  try {
    const { prisma } = await import("@/lib/prisma")

    let where: any = { points: { gt: 0 } }

    if (period === "daily") {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      where = { lastLogin: { gte: today }, points: { gt: 0 } }
    } else if (period === "weekly") {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      where = { lastLogin: { gte: weekAgo }, points: { gt: 0 } }
    } else if (period === "monthly") {
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      where = { lastLogin: { gte: monthAgo }, points: { gt: 0 } }
    }

    const users = await prisma.user.findMany({
      where,
      select: { walletId: true, name: true, points: true, level: true },
      orderBy: { points: "desc" },
      take: limit,
    })

    const result = users.map((u, i) => ({
      rank: i + 1,
      walletId: u.walletId,
      name: u.name || "Player",
      points: u.points,
      level: u.level || 1,
      badges: 0,
    }))

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
  }
}