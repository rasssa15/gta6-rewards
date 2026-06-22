import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || (session.user as any).role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  try {
    const [users, articles, rewards, redemptions, referrals, dailyLogins, scratchCards, achievements] = await Promise.all([
      prisma.user.count(),
      prisma.article.count(),
      prisma.reward.count(),
      prisma.redemption.count(),
      prisma.referral.count(),
      prisma.dailyLogin.count(),
      prisma.scratchCard.count(),
      prisma.userAchievement.count(),
    ])

    const pointsAgg = await prisma.user.aggregate({
      _sum: { totalPointsEarned: true, points: true },
    })

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dailyActive = await prisma.dailyLogin.count({ where: { date: today } })

    const topUsers = await prisma.user.findMany({
      orderBy: { points: "desc" },
      take: 10,
      select: {
        id: true, name: true, username: true, points: true, level: true, rank: true,
        adsWatched: true, articlesRead: true, createdAt: true,
        _count: { select: { referrals: true, redemptions: true, achievements: true } },
      },
      where: { role: { not: "admin" } },
    })

    const articlesByCategory = await prisma.article.groupBy({
      by: ["category"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    })

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          users, articles, rewards, redemptions, referrals, dailyLogins,
          scratchCards, achievements, dailyActive,
          totalPointsEarned: pointsAgg._sum.totalPointsEarned || 0,
          circulatingPoints: pointsAgg._sum.points || 0,
        },
        topUsers,
        articlesByCategory,
      },
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 })
  }
}
