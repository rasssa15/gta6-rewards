import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const period = searchParams.get("period") || "all"
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)

  try {
    let dateFilter: Date | null = null
    const now = new Date()
    if (period === "daily") dateFilter = new Date(now.setDate(now.getDate() - 1))
    else if (period === "weekly") dateFilter = new Date(now.setDate(now.getDate() - 7))
    else if (period === "monthly") dateFilter = new Date(now.setMonth(now.getMonth() - 1))

    const users = await prisma.user.findMany({
      orderBy: { points: "desc" },
      take: limit,
      select: {
        walletId: true,
        name: true,
        points: true,
        level: true,
        _count: { select: { achievements: true } },
      },
    })

    const ranked = users.map((u, i) => ({
      rank: i + 1,
      walletId: u.walletId,
      name: u.name,
      points: u.points,
      level: u.level,
      badges: u._count.achievements,
    }))

    return NextResponse.json(ranked)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
  }
}
