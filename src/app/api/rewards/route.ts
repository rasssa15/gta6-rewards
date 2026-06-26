import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    await applyDailyStockDecay()

    const rewards = await prisma.reward.findMany({
      where: { active: true },
      orderBy: [{ stock: "desc" }, { pointsCost: "asc" }],
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

async function applyDailyStockDecay() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split("T")[0]

  const setting = await prisma.setting.findUnique({ where: { key: "lastStockReset" } })
  const lastReset = setting?.value || ""

  if (lastReset !== todayStr) {
    // Reset to 50 then random decay based on time of day
    const coupons = await prisma.reward.findMany({
      where: { category: { startsWith: "coupon-" }, active: true },
    })

    const now = new Date()
    const hoursSinceMidnight = now.getHours() + now.getMinutes() / 60

    for (const coupon of coupons) {
      let stock = 50
      // Random decay throughout the day (0-3 per hour)
      for (let h = 0; h < Math.floor(hoursSinceMidnight); h++) {
        stock -= Math.floor(Math.random() * 4)
      }
      // Remaining partial hour decay
      stock -= Math.floor(Math.random() * Math.min(4, Math.ceil(hoursSinceMidnight % 1 * 4)))
      stock = Math.max(1, Math.min(50, stock))

      await prisma.reward.update({
        where: { id: coupon.id },
        data: { stock },
      })
    }

    await prisma.setting.upsert({
      where: { key: "lastStockReset" },
      create: { key: "lastStockReset", value: todayStr },
      update: { value: todayStr },
    })
  } else {
    // Already reset today — small random decrement on each fetch (simulate real-time buying)
    const shouldDecay = Math.random() < 0.3
    if (shouldDecay) {
      const coupons = await prisma.reward.findMany({
        where: { category: { startsWith: "coupon-" }, active: true, stock: { gt: 1 } },
      })
      const target = coupons[Math.floor(Math.random() * coupons.length)]
      if (target) {
        const decrease = Math.floor(Math.random() * 2) + 1
        await prisma.reward.update({
          where: { id: target.id },
          data: { stock: Math.max(1, target.stock - decrease) },
        })
      }
    }
  }
}
