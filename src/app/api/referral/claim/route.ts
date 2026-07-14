import { NextRequest, NextResponse } from "next/server"
import { getUserByWalletId } from "@/lib/data"
import { prisma } from "@/lib/prisma"
import { checkRateLimit } from "@/lib/rate-limit"

export async function POST(req: NextRequest) {
  try {
    const { walletId, code } = await req.json()
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    const { allowed, resetAt } = checkRateLimit(ip, req.method, req.nextUrl.pathname, walletId)
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests. Please slow down." }, {
        status: 429, headers: { "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)), "X-RateLimit-Remaining": "0" },
      })
    }
    if (!walletId || !code) {
      return NextResponse.json({ error: "walletId and code required" }, { status: 400 })
    }

    let user: any = getUserByWalletId(walletId)
    if (!user) {
      try {
        user = await prisma.user.findUnique({ where: { walletId } })
      } catch (e) {
        console.error("DB user lookup failed:", e)
      }
    }
    if (!user) {
      return NextResponse.json({ error: "User not found. Create a wallet first." }, { status: 404 })
    }

    if (user.referrerId) {
      return NextResponse.json({ error: "You already used a referral code!" }, { status: 400 })
    }

    const referrer = await prisma.user.findUnique({ where: { referralCode: code.toUpperCase() } })

    if (!referrer) {
      return NextResponse.json({ error: "Invalid referral code" }, { status: 400 })
    }
    if (referrer.id === user.id) {
      return NextResponse.json({ error: "You cannot refer yourself" }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { referrerId: referrer.id },
    })

    return NextResponse.json({ success: true, referrerName: referrer.name })
  } catch (error) {
    return NextResponse.json({ error: "Failed to claim referral" }, { status: 500 })
  }
}