import { NextRequest, NextResponse } from "next/server"
import { awardScratchCard } from "@/lib/scratch-card"

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    const result = await awardScratchCard(userId, "Scratch card play")

    return NextResponse.json({
      id: crypto.randomUUID(),
      userId,
      points: result.points,
      capped: result.capped,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to play scratch card" }, { status: 500 })
  }
}
