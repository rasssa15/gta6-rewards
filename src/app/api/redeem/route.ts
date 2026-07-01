import { NextRequest, NextResponse } from "next/server"
import { getUserByWalletId } from "@/lib/data"
import { prisma } from "@/lib/prisma"
import { detectUserCountry, resolveCodeCountry, getPlatformHours } from "@/lib/codes"

const VALID_PLATFORMS = ["steam", "epic", "nintendo", "xbox", "playstation"]

export async function POST(req: NextRequest) {
  try {
    const { userId, walletId, rewardId, platform } = await req.json()
    if ((!userId && !walletId) || !rewardId) {
      return NextResponse.json({ error: "userId or walletId, and rewardId required" }, { status: 400 })
    }

    const selectedPlatform = VALID_PLATFORMS.includes(platform) ? platform : "steam"

    const reward = await prisma.reward.findUnique({ where: { id: rewardId } })
    if (!reward) return NextResponse.json({ error: "Reward not found" }, { status: 404 })

    let user = null
    if (walletId) {
      user = getUserByWalletId(walletId)
      if (!user) {
        try {
          user = await prisma.user.findUnique({ where: { walletId } })
        } catch (e) {
          console.error("DB user lookup failed:", e)
        }
      }
    } else if (userId) {
      user = await prisma.user.findUnique({ where: { id: userId } })
    }
    if (!user) return NextResponse.json({ error: "User not found. Connect your wallet first." }, { status: 404 })
    if (reward.stock < 1) return NextResponse.json({ error: "Out of stock" }, { status: 400 })
    if (user.points < reward.pointsCost) {
      return NextResponse.json({ error: "Not enough points" }, { status: 400 })
    }

    const isWallpaperPack = reward.category === "wallpaper-pack"
    const isThemePack = reward.category === "theme-pack"
    const themeName = isThemePack ? reward.name.toLowerCase().includes("gta") ? "gta-neon" : "default" : null

    // Instant rewards (wallpaper, theme) no timer
    if (isWallpaperPack || isThemePack) {
      const [redemption] = await Promise.all([
        prisma.redemption.create({
          data: { userId: user.id, rewardId, status: "completed" },
        }),
        prisma.reward.update({
          where: { id: rewardId },
          data: { stock: { decrement: 1 } },
        }),
        prisma.user.update({
          where: { id: user.id },
          data: { points: { decrement: reward.pointsCost }, ...(themeName ? { theme: themeName } : {}) },
        }),
        prisma.pointTransaction.create({
          data: { userId: user.id, amount: -reward.pointsCost, reason: `Redeemed: ${reward.name}`, reference: rewardId },
        }),
      ])
      return NextResponse.json({ redemption, isWallpaperPack, isThemePack, themeName }, { status: 201 })
    }

    // Coupon code rewards — 24h timer + 20 popup ads
    const userCountry = detectUserCountry(req) || "US"
    const region = (user as any).region || ""
    const { codeCountry, codePrefix, label } = resolveCodeCountry(userCountry, region)
    const codeAvailableAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    const [redemption] = await Promise.all([
      prisma.redemption.create({
        data: {
          userId: user.id, rewardId, status: "pending_code",
          codeAvailableAt, popupAdsClicked: 0, popupAdsRequired: 20,
          userCountry, codeCountry, codePrefix,
        },
      }),
      prisma.reward.update({
        where: { id: rewardId },
        data: { stock: { decrement: 1 } },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { points: { decrement: reward.pointsCost } },
      }),
      prisma.pointTransaction.create({
        data: { userId: user.id, amount: -reward.pointsCost, reason: `Redeemed: ${reward.name}`, reference: rewardId },
      }),
    ])

    // Referral bonus on first redemption
    const redemptionCount = await prisma.redemption.count({ where: { userId: user.id } })
    const referrerId = (user as any).referrerId
    if (redemptionCount === 1 && referrerId) {
      const referrerBonus = 10 + Math.round(reward.pointsCost * 0.2)
      await prisma.user.update({
        where: { id: referrerId },
        data: { points: { increment: referrerBonus } },
      })
      await prisma.pointTransaction.create({
        data: {
          userId: referrerId,
          amount: referrerBonus,
          reason: `Referral bonus: ${user.name} redeemed ${reward.name}`,
        },
      })
    }

    return NextResponse.json({
      redemption: {
        ...redemption,
        codeAvailableAt: codeAvailableAt.toISOString(),
        codeCountry: label,
        codePrefix,
      },
      isCoupon: true,
      message: `Code will be available in 24 hours for ${label}. Watch 20 popup ads to unlock it.`,
    }, { status: 201 })
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
