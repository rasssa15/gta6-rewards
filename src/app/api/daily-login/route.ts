import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { awardScratchCard } from "@/lib/scratch-card"
import { checkRateLimit } from "@/lib/rate-limit"

const ADS_REQUIRED = 5

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    const { allowed, resetAt } = checkRateLimit(ip, req.method, req.nextUrl.pathname, userId)
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests. Please slow down." }, {
        status: 429, headers: { "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)), "X-RateLimit-Remaining": "0" },
      })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.adsWatched < ADS_REQUIRED) {
      return NextResponse.json({
        error: `Watch ${ADS_REQUIRED - user.adsWatched} more ads to claim daily login gift`,
        adsWatched: user.adsWatched,
        adsRequired: ADS_REQUIRED,
      }, { status: 400 })
    }

    const today = new Date().toISOString().split("T")[0]
    const alreadyClaimed = await prisma.pointTransaction.findFirst({
      where: { userId, reason: `Daily login: ${today}` },
    })
    if (alreadyClaimed) {
      return NextResponse.json({ error: "Already claimed today" }, { status: 400 })
    }

    const result = await awardScratchCard(userId, `Daily login: ${today}`)

    return NextResponse.json({
      success: true,
      scratchResult: result,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to claim daily login" }, { status: 500 })
  }
}
