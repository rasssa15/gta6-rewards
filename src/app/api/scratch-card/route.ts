import { NextRequest, NextResponse } from "next/server"
import { getUserByWalletId } from "@/lib/data"

export async function POST(req: NextRequest) {
  try {
    const { userId, walletId } = await req.json()
    const resolvedId = userId || null

    let dbId = resolvedId
    if (!dbId && walletId) {
      const user = getUserByWalletId(String(walletId).trim())
      if (user) dbId = user.id
    }

    if (!dbId) {
      return NextResponse.json({ error: "Connect your wallet first" }, { status: 400 })
    }

    const { prisma } = await import("@/lib/prisma")
    const { awardScratchCard } = await import("@/lib/scratch-card")

    const today = new Date().toISOString().split("T")[0]
    const alreadyPlayed = await prisma.pointTransaction.findFirst({
      where: { userId: dbId, reason: { startsWith: `Scratch card play: ${today}` } },
    })
    if (alreadyPlayed) {
      return NextResponse.json({ error: "Already played today. Come back tomorrow!" }, { status: 400 })
    }

    const result = await awardScratchCard(dbId, `Scratch card play: ${today}`)

    return NextResponse.json({
      id: crypto.randomUUID(),
      userId: dbId,
      points: result.points,
      tier: result.tier,
      label: result.label,
      emoji: result.emoji,
    })
  } catch (error) {
    console.error("Failed to play scratch card:", error)
    return NextResponse.json({ error: "Failed to play scratch card" }, { status: 500 })
  }
}
