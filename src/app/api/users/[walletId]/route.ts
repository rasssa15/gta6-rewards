import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: { walletId: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { walletId: params.walletId },
      include: {
        _count: { select: { pointTransactions: true, achievements: true, scratchResults: true } },
      },
    })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}
