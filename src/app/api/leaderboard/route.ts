import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const period = searchParams.get("period") || "all"
    const limit = parseInt(searchParams.get("limit") || "100")

    let orderBy: any = { points: "desc" }

    const users = await prisma.user.findMany({
      where: {
        role: { not: "admin" },
        points: { gt: 0 },
      },
      select: {
        id: true,
        username: true,
        name: true,
        image: true,
        points: true,
        xp: true,
        level: true,
        rank: true,
        _count: { select: { achievements: true } },
      },
      orderBy,
      take: limit,
    })

    const data = users.map((user, index) => ({
      position: index + 1,
      id: user.id,
      username: user.username,
      name: user.name,
      image: user.image,
      points: user.points,
      xp: user.xp,
      level: user.level,
      userRank: user.rank,
      achievementCount: user._count.achievements,
    }))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 })
  }
}
