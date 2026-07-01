import { NextRequest, NextResponse } from "next/server"
import { getUserByWalletId } from "@/lib/data"
import { checkRateLimit } from "@/lib/rate-limit"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")
  const walletId = searchParams.get("walletId")
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  const { allowed, resetAt } = checkRateLimit(ip, req.method, req.nextUrl.pathname, walletId || userId || undefined)
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Please slow down." }, {
      status: 429, headers: { "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)), "X-RateLimit-Remaining": "0" },
    })
  }

  try {
    const { prisma } = await import("@/lib/prisma")
    const EXCLUDED_KEYS = ["read_3_articles", "earn_20_points", "visit_daily"]
    const challenges = await prisma.challenge.findMany({
      where: { active: true, key: { notIn: EXCLUDED_KEYS } },
    })

    let adsWatched = 0
    let resolvedId: string | null = null

    if (walletId) {
      const jsonUser = getUserByWalletId(walletId)
      if (jsonUser) {
        adsWatched = jsonUser.adsWatched
        resolvedId = jsonUser.id
      } else {
        try {
          const dbUser = await prisma.user.findUnique({ where: { walletId } })
          if (dbUser) {
            adsWatched = dbUser.adsWatched
            resolvedId = dbUser.id
          }
        } catch (e) {
          console.error("DB user lookup failed:", e)
        }
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
    console.error("Failed to fetch challenges:", error)
    return NextResponse.json({ error: "Failed to fetch challenges" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { prisma } = await import("@/lib/prisma")
    const { checkRateLimit } = await import("@/lib/rate-limit")
    const data = await req.json()
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    const { allowed, resetAt } = checkRateLimit(ip, req.method, req.nextUrl.pathname)
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests. Please slow down." }, {
        status: 429, headers: { "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)), "X-RateLimit-Remaining": "0" },
      })
    }
    const challenge = await prisma.challenge.create({ data })
    return NextResponse.json(challenge, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create challenge" }, { status: 500 })
  }
}
