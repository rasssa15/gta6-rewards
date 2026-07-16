import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkRateLimit } from "@/lib/rate-limit"

const POINTS_POOL = [0, 0.1, 0.2, 0.5, 0.6, 0.7, 1.0]
const BASE_WEIGHTS = [55, 15, 10, 7, 5, 4, 4]

function pickPoints(): number {
  const total = BASE_WEIGHTS.reduce((a, b) => a + b, 0)
  const roll = Math.random() * total
  let cum = 0
  for (let i = 0; i < POINTS_POOL.length; i++) {
    cum += BASE_WEIGHTS[i]
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
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    const { allowed, resetAt } = checkRateLimit(ip, req.method, req.nextUrl.pathname, walletId)
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests. Please slow down." }, {
        status: 429, headers: { "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)), "X-RateLimit-Remaining": "0" },
      })
    }

    const user = await prisma.user.findFirst({
      where: { walletId: String(walletId).trim() },
    })

    if (!user) {
      return NextResponse.json({ error: "Wallet not connected" }, { status: 400 })
    }

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

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const todayTx = await prisma.pointTransaction.aggregate({
      where: { userId: user.id, amount: { gt: 0 }, createdAt: { gte: todayStart } },
      _sum: { amount: true },
    })
    const earnedToday = todayTx._sum.amount || 0

    if (earnedToday >= 350) {
      await prisma.pointTransaction.create({
        data: { userId: user.id, amount: 0, reason: "Ad reward" },
      }).catch(() => {})
      return NextResponse.json({ points: 0, adsWatched, cap: "daily" })
    }

    const firstTxToday = await prisma.pointTransaction.findFirst({
      where: { userId: user.id, createdAt: { gte: todayStart } },
      orderBy: { createdAt: "asc" },
    })

    if (firstTxToday) {
      const hoursSinceStart = (Date.now() - firstTxToday.createdAt.getTime()) / 3600000
      if (hoursSinceStart < 1 && earnedToday >= 120) {
        await prisma.pointTransaction.create({
          data: { userId: user.id, amount: 0, reason: "Ad reward" },
        }).catch(() => {})
        return NextResponse.json({ points: 0, adsWatched, cap: "hour1" })
      }
      if (hoursSinceStart < 2 && earnedToday >= 150) {
        await prisma.pointTransaction.create({
          data: { userId: user.id, amount: 0, reason: "Ad reward" },
        }).catch(() => {})
        return NextResponse.json({ points: 0, adsWatched, cap: "hour2" })
      }
    }

    const points = pickPoints()

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
