import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth/auth"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })

    const challenges = await prisma.challenge.findMany({
      where: { status: "active" },
    })

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const completions = await prisma.challengeCompletion.findMany({
      where: {
        userId: user.id,
        completedAt: { gte: today },
      },
    })

    const completedIds = new Set(completions.map((c) => c.challengeId))

    const data = challenges.map((challenge) => {
      let progress = 0
      switch (challenge.type) {
        case "daily":
          if (challenge.category === "reading") progress = user.articlesRead
          else if (challenge.category === "ads") progress = user.adsWatched
          else if (challenge.category === "scratch") progress = user.scratchCardsOpened
          else progress = 1
          break
      }

      return {
        id: challenge.id,
        name: challenge.name,
        description: challenge.description,
        requirement: challenge.requirement,
        progress: Math.min(progress, challenge.requirement),
        completed: completedIds.has(challenge.id) || progress >= challenge.requirement,
        points: challenge.points,
        xp: challenge.xp,
        icon: challenge.icon,
        category: challenge.category,
      }
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
  }

  try {
    const { challengeId } = await req.json()
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })

    const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } })
    if (!challenge || challenge.status !== "active") {
      return NextResponse.json({ success: false, error: "Challenge not found" }, { status: 404 })
    }

    const existing = await prisma.challengeCompletion.findUnique({
      where: { userId_challengeId: { userId: user.id, challengeId } },
    })

    if (existing) {
      return NextResponse.json({ success: false, error: "Already completed" }, { status: 400 })
    }

    await prisma.challengeCompletion.create({
      data: { userId: user.id, challengeId },
    })

    await prisma.user.update({
      where: { id: user.id },
      data: {
        points: { increment: challenge.points },
        totalPointsEarned: { increment: challenge.points },
        xp: { increment: challenge.xp },
      },
    })

    await prisma.pointTransaction.create({
      data: {
        userId: user.id,
        points: challenge.points,
        type: "earned",
        source: "challenge",
        reference: challenge.id,
        note: `Challenge: ${challenge.name}`,
      },
    })

    return NextResponse.json({ success: true, data: { points: challenge.points, xp: challenge.xp } })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 })
  }
}
