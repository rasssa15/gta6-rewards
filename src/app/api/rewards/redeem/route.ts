import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth/auth"
import { deductPoints } from "@/lib/utils/points"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
  }

  try {
    const { rewardId } = await req.json()
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })

    const reward = await prisma.reward.findUnique({ where: { id: rewardId } })
    if (!reward || reward.status !== "active") {
      return NextResponse.json({ success: false, error: "Reward not available" }, { status: 400 })
    }

    if (reward.stock <= 0) {
      return NextResponse.json({ success: false, error: "Out of stock" }, { status: 400 })
    }

    if (user.points < reward.cost) {
      return NextResponse.json({ success: false, error: "Insufficient points" }, { status: 400 })
    }

    await deductPoints(user.id, reward.cost, `Redeemed: ${reward.name}`)

    const redemption = await prisma.redemption.create({
      data: {
        userId: user.id,
        rewardId: reward.id,
        pointsCost: reward.cost,
        status: "pending",
      },
    })

    await prisma.reward.update({
      where: { id: reward.id },
      data: { stock: { decrement: 1 } },
    })

    return NextResponse.json({ success: true, data: redemption })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Redemption failed" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })

    const redemptions = await prisma.redemption.findMany({
      where: { userId: user.id },
      include: { reward: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return NextResponse.json({ success: true, data: redemptions })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 })
  }
}
