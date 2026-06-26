import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { awardScratchCard } from "@/lib/scratch-card"

export async function POST(req: NextRequest) {
  try {
    const { userId, walletId } = await req.json()
    const resolvedId = userId || null

    let dbId = resolvedId
    if (!dbId && walletId) {
      const user = await prisma.user.findUnique({ where: { walletId } })
      if (user) dbId = user.id
    }

    if (!dbId) {
      return NextResponse.json({ error: "userId or walletId required" }, { status: 400 })
    }

    const result = await awardScratchCard(dbId, "Scratch card play")

    return NextResponse.json({
      id: crypto.randomUUID(),
      userId: dbId,
      points: result.points,
      tier: result.tier,
      label: result.label,
      emoji: result.emoji,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to play scratch card" }, { status: 500 })
  }
}
