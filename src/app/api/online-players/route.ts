import { NextResponse } from "next/server"
import { readFileSync } from "fs"
import { join } from "path"

let cachedResponse: { data: any; timestamp: number } | null = null
const CACHE_DURATION = 10000

export async function GET() {
  const now = Date.now()
  if (cachedResponse && now - cachedResponse.timestamp < CACHE_DURATION) {
    return NextResponse.json(cachedResponse.data)
  }

  try {
    const configPath = join(process.cwd(), "public/data/online-players.json")
    const config = JSON.parse(readFileSync(configPath, "utf8"))
    const fakePlayers = Math.floor(Math.random() * (config.fake.max - config.fake.min + 1)) + config.fake.min

    const { prisma } = await import("@/lib/prisma")
    const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000)
    const realPlayers = await prisma.user.count({
      where: { lastLogin: { gte: fifteenMinAgo } },
    })

    const data = { fakePlayers, realPlayers, total: fakePlayers + realPlayers }
    cachedResponse = { data, timestamp: now }
    return NextResponse.json(data)
  } catch (error) {
    const data = { fakePlayers: 1500, realPlayers: 0, total: 1500 }
    return NextResponse.json(data)
  }
}
