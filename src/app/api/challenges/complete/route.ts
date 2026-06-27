import { NextRequest, NextResponse } from "next/server"
import { getUserByWalletId } from "@/lib/data"

const CHEST_REWARD_KEYS = new Set(["ad_20", "ad_40", "ad_75", "ad_100"])

export async function POST(req: NextRequest) {
  try {
    const { prisma } = await import("@/lib/prisma")
    const { awardScratchCard } = await import("@/lib/scratch-card")

    const { userId, walletId, challengeId } = await req.json()
    if ((!userId && !walletId) || !challengeId) {
      return NextResponse.json({ error: "userId/walletId and challengeId required" }, { status: 400 })
    }

    const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } })
    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 })
    }

    let dbUser = null
    if (walletId) {
      const jsonUser = getUserByWalletId(walletId)
      if (jsonUser) {
        dbUser = jsonUser
      } else {
        try {
          dbUser = await prisma.user.findUnique({ where: { walletId } })
        } catch (e) {
          console.error("DB user lookup failed:", e)
        }
      }
      if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 })
    } else if (userId) {
      dbUser = await prisma.user.findUnique({ where: { id: userId } })
    }
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const uid = dbUser.id
    const today = new Date().toISOString().split("T")[0]

    // For watch_ads challenges, check adsWatched
    let progress = 0
    let alreadyCompleted = false

    if (challenge.type === "watch_ads") {
      try {
        const existing = await prisma.challengeCompletion.findUnique({
          where: { userId_challengeId_date: { userId: uid, challengeId, date: "once" } },
        })
        alreadyCompleted = existing?.completed || false
      } catch {}
      progress = Math.min(dbUser.adsWatched, challenge.target)
    } else {
      try {
        const completion = await prisma.challengeCompletion.upsert({
          where: { userId_challengeId_date: { userId: uid, challengeId, date: today } },
          update: { progress: { increment: 1 } },
          create: { userId: uid, challengeId, date: today, progress: 1 },
        })
        progress = completion.progress
        alreadyCompleted = completion.completed
      } catch {}
    }

    let scratchResults: any[] | null = null
    const isCompleted = progress >= challenge.target

    if (isCompleted && !alreadyCompleted) {
      try {
        // Mark as completed
        await prisma.challengeCompletion.upsert({
          where: { userId_challengeId_date: { userId: uid, challengeId, date: challenge.type === "watch_ads" ? "once" : today } },
          update: { completed: true, completedAt: new Date(), progress },
          create: { userId: uid, challengeId, date: challenge.type === "watch_ads" ? "once" : today, progress, completed: true, completedAt: new Date() },
        })

        // Award XP
        await prisma.user.update({
          where: { id: uid },
          data: { xp: { increment: challenge.xpReward } },
        })
      } catch (e) {
        console.error("Failed to save challenge completion:", e)
      }

      // Award scratch cards (works with JSON or DB)
      if (CHEST_REWARD_KEYS.has(challenge.key)) {
        scratchResults = []
        for (let i = 0; i < 5; i++) {
          scratchResults.push(await awardScratchCard(uid, `Chest: ${challenge.title}`))
        }
      } else {
        scratchResults = [await awardScratchCard(uid, `Challenge: ${challenge.title}`, "gold")]
      }
    }

    return NextResponse.json({
      progress,
      completed: isCompleted || alreadyCompleted,
      target: challenge.target,
      xpReward: challenge.xpReward,
      scratchResults,
    })
  } catch (error) {
    console.error("Failed to update challenge:", error)
    return NextResponse.json({ error: "Failed to update challenge" }, { status: 500 })
  }
}
