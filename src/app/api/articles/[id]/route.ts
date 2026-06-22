import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const article = await prisma.article.findFirst({
      where: {
        OR: [{ slug: params.id }, { id: params.id }],
      },
      include: {
        author: { select: { name: true, image: true, username: true } },
        comments: {
          where: { status: "active", parentId: null },
          include: {
            user: { select: { name: true, image: true, username: true, rank: true } },
            replies: {
              where: { status: "active" },
              include: {
                user: { select: { name: true, image: true, username: true, rank: true } },
              },
              orderBy: { createdAt: "asc" },
            },
          },
          orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
        },
        _count: { select: { comments: true, bookmarks: true, views: true } },
      },
    })

    if (!article) {
      return NextResponse.json({ success: false, error: "Article not found" }, { status: 404 })
    }

    await prisma.article.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    })

    const related = await prisma.article.findMany({
      where: {
        category: article.category,
        id: { not: article.id },
        status: "published",
      },
      take: 3,
      select: {
        id: true,
        title: true,
        slug: true,
        imageUrl: true,
        category: true,
        readTime: true,
        publishedAt: true,
      },
      orderBy: { publishedAt: "desc" },
    })

    return NextResponse.json({
      success: true,
      data: { ...article, related },
    })
  } catch (error) {
    console.error("Article error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch article" }, { status: 500 })
  }
}
