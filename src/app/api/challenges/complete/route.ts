import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { awardScratchCard } from "@/lib/scratch-card"

export async function POST(req: NextRequest) {
  try {
    const { userId, challengeId } = await req.json()
    if (!userId || !challengeId) {
      return NextResponse.json({ error: "userId and challengeId required" }, { status: 400 })
    }

    const today = new Date().toISOString().split("T")[0]
    const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } })
    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 })
    }

    const completion = await prisma.challengeCompletion.upsert({
      where: { userId_challengeId_date: { userId, challengeId, date: today } },
      update: { progress: { increment: 1 } },
      create: { userId, challengeId, date: today, progress: 1 },
    })

    let scratchResult = null
    const isCompleted = completion.progress >= challenge.target
    if (isCompleted && !completion.completed) {
      await prisma.challengeCompletion.update({
        where: { id: completion.id },
        data: { completed: true, completedAt: new Date() },
      })
      await prisma.user.update({
        where: { id: userId },
        data: { xp: { increment: challenge.xpReward } },
      })
      scratchResult = await awardScratchCard(userId, `Challenge: ${challenge.title}`)
    }

    return NextResponse.json({
      ...completion,
      completed: isCompleted || completion.completed,
      target: challenge.target,
      xpReward: challenge.xpReward,
      scratchResult,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update challenge" }, { status: 500 })
  }
}
