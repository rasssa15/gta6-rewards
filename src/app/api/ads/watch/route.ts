import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { awardScratchCard } from "@/lib/scratch-card"

export async function POST(req: NextRequest) {
  try {
    const { walletId } = await req.json()
    if (!walletId) {
      return NextResponse.json({ error: "walletId required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { walletId } })
    if (!user) {
      return NextResponse.json({ error: "Wallet not connected" }, { status: 400 })
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { adsWatched: { increment: 1 } },
    })

    const scratch = await awardScratchCard(user.id, "Watched an ad")

    return NextResponse.json({
      adsWatched: updated.adsWatched,
      points: scratch.points,
      tier: scratch.tier,
      label: scratch.label,
      emoji: scratch.emoji,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to process ad watch" }, { status: 500 })
  }
}
