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
    const [
      totalUsers,
      totalArticles,
      totalRedemptions,
      totalPoints,
      totalAdsWatched,
      recentUsers,
      topArticles,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.article.count({ where: { status: "published" } }),
      prisma.redemption.count(),
      prisma.user.aggregate({ _sum: { totalPointsEarned: true } }),
      prisma.user.aggregate({ _sum: { adsWatched: true } }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, email: true, points: true, createdAt: true },
      }),
      prisma.article.findMany({
        orderBy: { viewCount: "desc" },
        take: 5,
        select: { id: true, title: true, viewCount: true, category: true },
      }),
    ])

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const dailyLogins = await prisma.dailyLogin.count({
      where: { date: today },
    })

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalArticles,
          totalRedemptions,
          totalPointsEarned: totalPoints._sum.totalPointsEarned || 0,
          totalAdsWatched: totalAdsWatched._sum.adsWatched || 0,
          dailyActiveUsers: dailyLogins,
        },
        recentUsers,
        topArticles,
      },
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 })
  }
}
