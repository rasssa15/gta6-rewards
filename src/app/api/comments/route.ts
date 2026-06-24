import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const articleId = searchParams.get("articleId")
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)

  try {
    const where: any = {}
    if (articleId) where.articleId = articleId

    const comments = await prisma.comment.findMany({
      where,
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: limit,
    })
    return NextResponse.json(comments)
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

    const comment = await prisma.comment.create({
      data: { content, articleId, userId, parentId: parentId || null },
      include: { user: { select: { name: true } } },
    })
    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
  }
}
