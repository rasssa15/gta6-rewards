import { NextRequest, NextResponse } from "next/server"
import { getUserByWalletId } from "@/lib/data"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const walletId = searchParams.get("walletId")

  if (!walletId) {
    return NextResponse.json({ error: "walletId required" }, { status: 400 })
  }

  try {
    let user: any = getUserByWalletId(walletId)
    if (!user) {
      try {
        user = await prisma.user.findUnique({ where: { walletId } })
      } catch (e) {
        console.error("DB user lookup failed:", e)
      }
    }
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Generate referral code from walletId
    const code = user.walletId.slice(2, 8).toUpperCase() + (user.name || "PLAYER").slice(0, 4).toUpperCase()
    const link = `${process.env.NEXT_PUBLIC_SITE_URL || "https://gta6-rewards.vercel.app"}/referral?ref=${code}`

    const referralCount = await prisma.user.count({ where: { referrerId: user.id } })
    const bonusEarned = await prisma.pointTransaction.aggregate({
      where: { userId: user.id, reason: { startsWith: "Referral bonus" } },
      _sum: { amount: true },
    })

    return NextResponse.json({
      code,
      link,
      referralCount,
      bonusEarned: bonusEarned._sum.amount || 0,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to get referral info" }, { status: 500 })
  }
}
