import { NextRequest, NextResponse } from "next/server"
import { getCommentsForArticle, getAllArticles } from "@/lib/data"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const articleId = searchParams.get("articleId")
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)

  try {
    const jsonComments = articleId ? getCommentsForArticle(articleId) : []
    const dbComments = articleId ? await prisma.comment.findMany({
      where: { articleId },
      include: { user: { select: { name: true, walletId: true } } },
      orderBy: { createdAt: "desc" },
      take: limit,
    }) : []

    const merged = mergeAndDedup(
      jsonComments,
      dbComments.map(c => ({
        id: c.id,
        content: c.content,
        articleId: c.articleId,
        userId: c.userId,
        userName: c.user?.name || "Player",
        walletId: c.user?.walletId || "",
        likes: c.likes,
        parentId: c.parentId,
        createdAt: c.createdAt.toISOString(),
      }))
    )

    return NextResponse.json(merged.slice(0, limit))
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { content, articleId, walletId, parentId } = await req.json()
    if (!content || !articleId || !walletId) {
      return NextResponse.json({ error: "content, articleId, walletId required" }, { status: 400 })
    }

    const user = await prisma.user.upsert({
      where: { walletId },
      update: { lastLogin: new Date() },
      create: { walletId, name: "Player", lastLogin: new Date() },
    })

    // Ensure article exists in DB for FK constraint
    await prisma.article.upsert({
      where: { id: articleId },
      update: {},
      create: { id: articleId, title: "Article", slug: articleId },
    })

    const comment = await prisma.comment.create({
      data: { content, articleId, userId: user.id, parentId: parentId || null },
      include: { user: { select: { name: true, walletId: true } } },
    })

    return NextResponse.json({
      id: comment.id,
      content: comment.content,
      articleId: comment.articleId,
      userId: comment.userId,
      userName: comment.user?.name || "Player",
      walletId: comment.user?.walletId || "",
      likes: comment.likes,
      parentId: comment.parentId,
      createdAt: comment.createdAt.toISOString(),
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
  }
}

function mergeAndDedup(json: any[], db: any[]) {
  const seen = new Set<string>()
  const result: any[] = []
  for (const c of [...db, ...json]) {
    if (!seen.has(c.id)) {
      seen.add(c.id)
      result.push(c)
    }
  }
  return result
}
