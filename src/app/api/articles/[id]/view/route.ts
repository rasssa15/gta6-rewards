import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { awardScratchCard } from "@/lib/scratch-card"
import { checkRateLimit } from "@/lib/rate-limit"

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await req.json()
    const articleId = params.id
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    const { allowed, resetAt } = checkRateLimit(ip, req.method, req.nextUrl.pathname, userId || undefined)
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests. Please slow down." }, {
        status: 429, headers: { "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)), "X-RateLimit-Remaining": "0" },
      })
    }

    // Ensure article exists in DB for FK constraint
    await prisma.article.upsert({
      where: { id: articleId },
      update: {},
      create: { id: articleId, title: "Article", slug: articleId },
    })

    await prisma.articleView.create({
      data: { articleId, userId: userId || null },
    })
    await prisma.article.update({
      where: { id: articleId },
      data: { viewCount: { increment: 1 } },
    })

    let scratchResult = null
    if (userId) {
      scratchResult = await awardScratchCard(userId, "Read article")
    }

    return NextResponse.json({ success: true, scratchResult })
  } catch (error) {
    return NextResponse.json({ error: "Failed to record view" }, { status: 500 })
  }
}
