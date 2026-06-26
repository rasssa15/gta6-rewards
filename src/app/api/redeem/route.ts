import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createHash, randomBytes } from "crypto"

function generateCouponCode(rewardName: string): string {
  const prefix = rewardName.slice(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, "X")
  const rand = randomBytes(4).toString("hex").toUpperCase()
  return `${prefix}-${rand}`
}

export async function POST(req: NextRequest) {
  try {
    const { userId, rewardId } = await req.json()
    if (!userId || !rewardId) {
      return NextResponse.json({ error: "userId and rewardId required" }, { status: 400 })
    }

    const [user, reward] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.reward.findUnique({ where: { id: rewardId } }),
    ])

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
    if (!reward) return NextResponse.json({ error: "Reward not found" }, { status: 404 })
    if (reward.stock < 1) return NextResponse.json({ error: "Out of stock" }, { status: 400 })
    if (user.points < reward.pointsCost) {
      return NextResponse.json({ error: "Not enough points" }, { status: 400 })
    }

    const couponCode = reward.category === "coupon" ? generateCouponCode(reward.name) : null

    const [redemption] = await Promise.all([
      prisma.redemption.create({
        data: { userId, rewardId, status: couponCode ? "completed" : "pending" },
      }),
      prisma.reward.update({
        where: { id: rewardId },
        data: { stock: { decrement: 1 } },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { points: { decrement: reward.pointsCost } },
      }),
      prisma.pointTransaction.create({
        data: { userId, amount: -reward.pointsCost, reason: `Redeemed: ${reward.name}`, reference: rewardId },
      }),
    ])

    // Referral bonus on first redemption
    const redemptionCount = await prisma.redemption.count({ where: { userId } })
    if (redemptionCount === 1 && user.referrerId) {
      const referrerBonus = 10 + Math.round(reward.pointsCost * 0.2)
      await prisma.user.update({
        where: { id: user.referrerId },
        data: { points: { increment: referrerBonus } },
      })
      await prisma.pointTransaction.create({
        data: {
          userId: user.referrerId,
          amount: referrerBonus,
          reason: `Referral bonus: ${user.name} redeemed ${reward.name}`,
        },
      })
    }

    return NextResponse.json({ redemption, couponCode }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to redeem" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")

  try {
    const where: any = {}
    if (userId) where.userId = userId

    const redemptions = await prisma.redemption.findMany({
      where,
      include: { reward: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    })
    return NextResponse.json(redemptions)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch redemptions" }, { status: 500 })
  }
}
