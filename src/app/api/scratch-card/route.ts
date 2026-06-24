import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const REWARDS = [1, 2, 5, 10, 25, 50]

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const weights = [40, 25, 15, 10, 7, 3]
    const totalWeight = weights.reduce((a, b) => a + b, 0)
    let random = Math.random() * totalWeight
    let points = REWARDS[0]
    for (let i = 0; i < weights.length; i++) {
      random -= weights[i]
      if (random <= 0) { points = REWARDS[i]; break }
    }

    const result = await prisma.scratchResult.create({
      data: { userId, points },
    })

    if (points > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: { points: { increment: points }, scratchCardsPlayed: { increment: 1 } },
      })
      await prisma.pointTransaction.create({
        data: { userId, amount: points, reason: "Scratch card win" },
      })
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: "Failed to play scratch card" }, { status: 500 })
  }
}
