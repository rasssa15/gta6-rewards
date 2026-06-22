import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth/auth"

export async function GET() {
  const session = await getServerSession(authOptions)

  try {
    const achievements = await prisma.achievement.findMany({
      orderBy: { category: "asc" },
    })

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
          achievements: { select: { achievementId: true, unlockedAt: true } },
        },
      })

      if (user) {
        const userAchievementIds = new Set(user.achievements.map((a) => a.achievementId))
        const data = achievements.map((a) => ({
          ...a,
          unlocked: userAchievementIds.has(a.id),
          unlockedAt: user.achievements.find((ua) => ua.achievementId === a.id)?.unlockedAt || null,
        }))

        return NextResponse.json({
          success: true,
          data,
          stats: {
            total: achievements.length,
            unlocked: userAchievementIds.size,
          },
        })
      }
    }

    return NextResponse.json({ success: true, data: achievements })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 })
  }
}
