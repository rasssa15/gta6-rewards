import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get("limit") || "50")
    const type = searchParams.get("type")

    const where: any = { status: "active" }
    if (type) where.type = type

    const rewards = await prisma.reward.findMany({
      where,
      orderBy: { cost: "asc" },
      take: limit,
    })

    return NextResponse.json({ success: true, data: rewards })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch rewards" }, { status: 500 })
  }
}
