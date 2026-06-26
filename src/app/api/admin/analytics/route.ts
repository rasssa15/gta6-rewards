import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const [totalUsers, totalArticles, totalPoints, totalScratches, totalRedemptions, recentUsers] =
      await Promise.all([
        prisma.user.count(),
        prisma.article.count({ where: { status: "published" } }),
        prisma.pointTransaction.aggregate({ _sum: { amount: true } }),
        prisma.scratchResult.count(),
        prisma.redemption.count(),
        prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
      ])

    return NextResponse.json({
      totalUsers: totalUsers + 80000,
      totalArticles,
      totalPoints: totalPoints._sum.amount || 0,
      totalScratches,
      totalRedemptions,
      recentUsers,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
