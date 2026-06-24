import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { walletId, name } = await req.json()
    if (!walletId) {
      return NextResponse.json({ error: "walletId required" }, { status: 400 })
    }

    const user = await prisma.user.upsert({
      where: { walletId },
      update: { lastLogin: new Date() },
      create: { walletId, name: name || "Player", lastLogin: new Date() },
    })

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)
  const offset = parseInt(searchParams.get("offset") || "0")

  try {
    const users = await prisma.user.findMany({
      orderBy: { points: "desc" },
      take: limit,
      skip: offset,
      select: { walletId: true, name: true, points: true, level: true, createdAt: true },
    })
    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
