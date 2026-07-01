import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const AD_POINTS_CAP = 120

const POINTS_POOL = [0, 0.1, 0.2, 0.5, 0.6, 0.7, 1.0]
const BASE_WEIGHTS = [55, 15, 10, 7, 5, 4, 4]

function pickPoints(totalEarned: number): number {
  const zeroBoost = Math.min(35, Math.floor(totalEarned / 10))
  const weights = BASE_WEIGHTS.map((w, i) => i === 0 ? w + zeroBoost : w)
  const total = weights.reduce((a, b) => a + b, 0)
  const roll = Math.random() * total
  let cum = 0
  for (let i = 0; i < POINTS_POOL.length; i++) {
    cum += weights[i]
    if (roll < cum) return POINTS_POOL[i]
  }
  return 0
}

export async function POST(req: NextRequest) {
  try {
    const { walletId } = await req.json()
    if (!walletId) {
      return NextResponse.json({ error: "walletId required" }, { status: 400 })
    }

    const user = await prisma.user.findFirst({
      where: { walletId: String(walletId).trim() },
    })

    if (!user) {
      return NextResponse.json({ error: "Wallet not connected" }, { status: 400 })
    }

    const txAgg = await prisma.pointTransaction.aggregate({
      where: { userId: user.id, reason: "Ad reward" },
      _sum: { amount: true },
    })
    const totalAdPoints = txAgg._sum.amount || 0

    let adsWatched = user.adsWatched
    try {
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { adsWatched: { increment: 1 } },
      })
      adsWatched = updated.adsWatched
    } catch {
      adsWatched = (user.adsWatched || 0) + 1
    }

    if (totalAdPoints >= AD_POINTS_CAP) {
      await prisma.pointTransaction.create({
        data: { userId: user.id, amount: 0, reason: "Ad reward" },
      }).catch(() => {})
      return NextResponse.json({ points: 0, adsWatched })
    }

    const raw = pickPoints(totalAdPoints)
    const remaining = AD_POINTS_CAP - totalAdPoints
    const points = Math.min(raw, remaining)

    if (points > 0) {
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { points: { increment: points } },
        })
      } catch {}
    }

    await prisma.pointTransaction.create({
      data: { userId: user.id, amount: points, reason: "Ad reward" },
    }).catch(() => {})

    return NextResponse.json({ points, adsWatched })
  } catch (error) {
    console.error("Failed to process ad watch:", error)
    return NextResponse.json({ error: "Failed to process ad watch" }, { status: 500 })
  }
}
