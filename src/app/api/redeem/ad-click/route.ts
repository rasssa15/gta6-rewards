import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { redemptionId, walletId } = await req.json()
    if (!redemptionId || !walletId) {
      return NextResponse.json({ error: "redemptionId and walletId required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { walletId } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const redemption = await prisma.redemption.findUnique({ where: { id: redemptionId } })
    if (!redemption || redemption.userId !== user.id) {
      return NextResponse.json({ error: "Redemption not found" }, { status: 404 })
    }

    if (redemption.status !== "pending_code") {
      return NextResponse.json({ error: "Code already generated or expired" }, { status: 400 })
    }

    const updated = await prisma.redemption.update({
      where: { id: redemptionId },
      data: { popupAdsClicked: { increment: 1 } },
    })

    // Also increment user's total popup clicks
    await prisma.user.update({
      where: { id: user.id },
      data: { popupAdsClicked: { increment: 1 } },
    })

    return NextResponse.json({
      popupAdsClicked: updated.popupAdsClicked,
      popupAdsRequired: updated.popupAdsRequired,
      remaining: updated.popupAdsRequired - updated.popupAdsClicked,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to log ad click" }, { status: 500 })
  }
}
