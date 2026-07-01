import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkRateLimit } from "@/lib/rate-limit"

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await req.json()
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    const { allowed, resetAt } = checkRateLimit(ip, req.method, req.nextUrl.pathname, userId)
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests. Please slow down." }, {
        status: 429, headers: { "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)), "X-RateLimit-Remaining": "0" },
      })
    }

    // Ensure article exists in DB for FK constraint
    await prisma.article.upsert({
      where: { id: params.id },
      update: {},
      create: { id: params.id, title: "Article", slug: params.id },
    })

    const existing = await prisma.articleBookmark.findUnique({
      where: { userId_articleId: { userId, articleId: params.id } },
    })

    if (existing) {
      await prisma.articleBookmark.delete({ where: { id: existing.id } })
      return NextResponse.json({ bookmarked: false })
    } else {
      await prisma.articleBookmark.create({
        data: { userId, articleId: params.id },
      })
      return NextResponse.json({ bookmarked: true })
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to toggle bookmark" }, { status: 500 })
  }
}
