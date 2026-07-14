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

    const existingArticle = await prisma.article.findUnique({ where: { id: articleId }, select: { id: true } })
    if (!existingArticle) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 })
    }

    if (userId) {
      const recentView = await prisma.articleView.findFirst({
        where: { articleId, userId, createdAt: { gte: new Date(Date.now() - 3600000) } },
      })
      if (!recentView) {
        await prisma.articleView.create({ data: { articleId, userId } })
        await prisma.article.update({ where: { id: articleId }, data: { viewCount: { increment: 1 } } })
      }
    } else {
      await prisma.articleView.create({ data: { articleId, userId: null } })
      await prisma.article.update({ where: { id: articleId }, data: { viewCount: { increment: 1 } } })
    }

    let scratchResult = null
    if (userId) {
      scratchResult = await awardScratchCard(userId, "Read article")
    }

    return NextResponse.json({ success: true, scratchResult })
  } catch (error) {
    return NextResponse.json({ error: "Failed to record view" }, { status: 500 })
  }
}