import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const rewards = await prisma.reward.findMany({
      where: { active: true, stock: { gt: 0 } },
      orderBy: { pointsCost: "asc" },
    })
    return NextResponse.json(rewards)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch rewards" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const reward = await prisma.reward.create({ data })
    return NextResponse.json(reward, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create reward" }, { status: 500 })
  }
}
