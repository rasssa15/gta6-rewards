import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)
  const offset = parseInt(searchParams.get("offset") || "0")

  try {
    const where: any = {}
    if (userId) where.userId = userId

    const [transactions, total] = await Promise.all([
      prisma.pointTransaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.pointTransaction.count({ where }),
    ])

    return NextResponse.json({ transactions, total, limit, offset })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch points" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, amount, reason, reference } = await req.json()
    if (!userId || !amount || !reason) {
      return NextResponse.json({ error: "userId, amount, reason required" }, { status: 400 })
    }

    const [tx] = await Promise.all([
      prisma.pointTransaction.create({
        data: { userId, amount, reason, reference: reference || "" },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { points: { increment: amount }, xp: { increment: Math.abs(amount) } },
      }),
    ])

    return NextResponse.json(tx, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to add points" }, { status: 500 })
  }
}
