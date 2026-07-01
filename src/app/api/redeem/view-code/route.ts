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

    if (!redemption.code) {
      return NextResponse.json({ error: "Code not yet generated" }, { status: 400 })
    }

    if (redemption.codeViewed) {
      return NextResponse.json({ error: "This code has already been viewed and is no longer available", alreadyViewed: true }, { status: 400 })
    }

    // One-time view: return code and mark as viewed (destroy)
    const result = await prisma.redemption.update({
      where: { id: redemptionId },
      data: { codeViewed: true, codeViewCount: { increment: 1 }, status: "code_viewed" },
    })

    return NextResponse.json({
      code: result.code,
      codeCountry: result.codeCountry,
      message: "This code is for one-time view only. It has now been destroyed and cannot be viewed again.",
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to view code" }, { status: 500 })
  }
}
