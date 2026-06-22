import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth/auth"
import { generateScratchCardReward } from "@/lib/utils/scratch-card"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
  }

  try {
    const { adId, completed } = await req.json()
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })

    if (!completed) {
      return NextResponse.json({ success: false, error: "Ad not completed" }, { status: 400 })
    }

    const pointsReward = 2

    await prisma.user.update({
      where: { id: user.id },
      data: {
        points: { increment: pointsReward },
        totalPointsEarned: { increment: pointsReward },
        adsWatched: { increment: 1 },
      },
    })

    await prisma.pointTransaction.create({
      data: {
        userId: user.id,
        points: pointsReward,
        type: "earned",
        source: "ad_watch",
        note: "Rewarded ad completed",
      },
    })

    const scratchReward = await generateScratchCardReward()
    const scratchCard = await prisma.scratchCard.create({
      data: {
        userId: user.id,
        reward: scratchReward,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        pointsEarned: pointsReward,
        scratchCardAwarded: true,
        scratchCardId: scratchCard.id,
      },
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 })
  }
}
