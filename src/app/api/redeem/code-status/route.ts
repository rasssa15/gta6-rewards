import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateRealCode } from "@/lib/codes"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const redemptionId = searchParams.get("redemptionId")
    const walletId = searchParams.get("walletId")

    if (!redemptionId || !walletId) {
      return NextResponse.json({ error: "redemptionId and walletId required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { walletId } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const redemption = await prisma.redemption.findUnique({ where: { id: redemptionId } })
    if (!redemption || redemption.userId !== user.id) {
      return NextResponse.json({ error: "Redemption not found" }, { status: 404 })
    }

    const now = Date.now()
    const availableAt = redemption.codeAvailableAt?.getTime() || (now + 86400000)
    const timeRemaining = Math.max(0, availableAt - now)
    const timerReady = timeRemaining <= 0
    const adsDone = redemption.popupAdsClicked >= redemption.popupAdsRequired

    // Check daily login (at least 1 daily login ever during this period)
    const dailyLoginCount = await prisma.pointTransaction.count({
      where: { userId: user.id, reason: { startsWith: "Daily login:" } },
    })
    const dailyLoginDone = dailyLoginCount >= 1

    // Check challenges completed (at least 5)
    const challengesCompleted = await prisma.challengeCompletion.count({
      where: { userId: user.id, completed: true },
    })
    const challengesDone = challengesCompleted >= 5

    const allRequirementsMet = timerReady && adsDone && dailyLoginDone && challengesDone
    const codeReady = allRequirementsMet

    // Auto-generate unique code when all requirements met
    let code = redemption.code
    if (codeReady && !code) {
      let attempts = 0
      while (attempts < 20) {
        code = generateRealCode(redemption.platform || "steam")
        const existing = await prisma.redemption.findFirst({ where: { code } })
        if (!existing) break
        attempts++
      }
      await prisma.redemption.update({
        where: { id: redemptionId },
        data: { code, status: "code_ready" },
      })
    }

    return NextResponse.json({
      id: redemption.id,
      status: redemption.status,
      platform: redemption.platform || "steam",
      timeRemaining,
      timerReady,
      popupAdsClicked: redemption.popupAdsClicked,
      popupAdsRequired: redemption.popupAdsRequired,
      adsDone,
      dailyLoginCount,
      dailyLoginDone,
      dailyLoginRequired: 1,
      challengesCompleted,
      challengesDone,
      challengesRequired: 5,
      codeReady,
      codeGenerated: !!code,
      codeViewed: redemption.codeViewed,
      codeCountry: redemption.codeCountry,
      userCountry: redemption.userCountry,
      createdAt: redemption.createdAt.toISOString(),
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to check status" }, { status: 500 })
  }
}
