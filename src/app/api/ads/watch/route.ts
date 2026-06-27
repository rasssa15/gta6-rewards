import { NextRequest, NextResponse } from "next/server"
import { getUserByWalletId } from "@/lib/data"

export async function POST(req: NextRequest) {
  try {
    const { walletId } = await req.json()
    if (!walletId) {
      return NextResponse.json({ error: "walletId required" }, { status: 400 })
    }

    const user = getUserByWalletId(String(walletId).trim())
    if (!user) {
      return NextResponse.json({ error: "Wallet not connected" }, { status: 400 })
    }

    const { prisma } = await import("@/lib/prisma")
    const { awardScratchCard } = await import("@/lib/scratch-card")

    let adsWatched = user.adsWatched
    try {
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { adsWatched: { increment: 1 } },
      })
      adsWatched = updated.adsWatched
    } catch (e) {
      adsWatched = (user.adsWatched || 0) + 1
    }

    const scratch = await awardScratchCard(user.id, "Watched an ad")

    return NextResponse.json({
      adsWatched,
      points: scratch.points,
      tier: scratch.tier,
      label: scratch.label,
      emoji: scratch.emoji,
    })
  } catch (error) {
    console.error("Failed to process ad watch:", error)
    return NextResponse.json({ error: "Failed to process ad watch" }, { status: 500 })
  }
}
