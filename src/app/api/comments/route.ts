import { NextRequest, NextResponse } from "next/server"
import { getCommentsForArticle, getAllArticles } from "@/lib/data"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const articleId = searchParams.get("articleId")
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)

  try {
    if (articleId) {
      const comments = getCommentsForArticle(articleId)
      const sliced = comments.slice(0, limit)
      return NextResponse.json(sliced)
    }
    return NextResponse.json([])
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { content, articleId, userId, parentId } = await req.json()
    if (!content || !articleId || !userId) {
      return NextResponse.json({ error: "content, articleId, userId required" }, { status: 400 })
    }
    const { prisma } = await import("@/lib/prisma")
    const comment = await prisma.comment.create({
      data: { content, articleId, userId, parentId: parentId || null },
      include: { user: { select: { name: true } } },
    })
    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
  }
}
