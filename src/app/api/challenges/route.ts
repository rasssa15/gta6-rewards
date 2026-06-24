import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")

  try {
    const challenges = await prisma.challenge.findMany({
      where: { active: true },
    })

    if (userId) {
      const today = new Date().toISOString().split("T")[0]
      const completions = await prisma.challengeCompletion.findMany({
        where: { userId, date: today },
      })

      const challengesWithProgress = challenges.map((ch) => {
        const completion = completions.find((c) => c.challengeId === ch.id)
        return {
          ...ch,
          progress: completion?.progress || 0,
          completed: completion?.completed || false,
        }
      })
      return NextResponse.json(challengesWithProgress)
    }

    return NextResponse.json(challenges)
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
