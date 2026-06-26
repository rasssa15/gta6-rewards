import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")
  const walletId = searchParams.get("walletId")

  try {
    const challenges = await prisma.challenge.findMany({
      where: { active: true },
    })

    let adsWatched = 0
    let resolvedId: string | null = null

    if (walletId) {
      const user = await prisma.user.findUnique({ where: { walletId } })
      if (user) {
        adsWatched = user.adsWatched
        resolvedId = user.id
      }
    } else if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } })
      if (user) {
        adsWatched = user.adsWatched
        resolvedId = user.id
      }
    }

    // Find completions for watch_ads (date: "once")
    const onceCompletions = resolvedId
      ? await prisma.challengeCompletion.findMany({
          where: { userId: resolvedId, date: "once" },
        })
      : []

    const challengesWithProgress = challenges.map((ch) => {
      const target = ch.target || 1
      const completion = onceCompletions.find((c) => c.challengeId === ch.id)

      if (ch.type === "watch_ads") {
        return {
          ...ch,
          progress: Math.min(adsWatched, target),
          completed: completion?.completed || false,
          target,
        }
      }

      return {
        ...ch,
        progress: completion?.progress || 0,
        completed: completion?.completed || false,
        target,
      }
    })

    return NextResponse.json(challengesWithProgress)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch challenges" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const challenge = await prisma.challenge.create({ data })
    return NextResponse.json(challenge, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create challenge" }, { status: 500 })
  }
}
