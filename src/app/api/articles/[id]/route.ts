import { NextRequest, NextResponse } from "next/server"
import { getArticleBySlug, getArticleById, ArticleData } from "@/lib/data"

async function getDbArticle(slugOrId: string): Promise<ArticleData | undefined> {
  try {
    const { prisma } = await import("@/lib/prisma")
    const dbArticle = await prisma.article.findFirst({
      where: {
        OR: [{ slug: slugOrId }, { id: slugOrId }],
        status: "published",
      },
      include: { category: true },
    })
    if (!dbArticle) return undefined
    return {
      id: dbArticle.id,
      title: dbArticle.title,
      slug: dbArticle.slug,
      excerpt: dbArticle.excerpt,
      content: dbArticle.content,
      categoryId: dbArticle.categoryId || "",
      categorySlug: dbArticle.category?.slug || "",
      categoryName: dbArticle.category?.name || "",
      featuredImage: dbArticle.featuredImage,
      prices: dbArticle.prices,
      author: dbArticle.author,
      status: dbArticle.status,
      viewCount: dbArticle.viewCount,
      readingTime: dbArticle.readingTime,
      tags: dbArticle.tags,
      metaTitle: dbArticle.seoTitle,
      metaDescription: dbArticle.seoDesc,
      keywords: "",
      createdAt: dbArticle.createdAt.toISOString(),
    }
  } catch {
    return undefined
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    let article = getArticleById(params.id)
    if (!article) article = getArticleBySlug(params.id)
    if (!article) article = await getDbArticle(params.id)
    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 })
    }
    return NextResponse.json(article)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch article" }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await req.json()
    const { prisma } = await import("@/lib/prisma")
    const article = await prisma.article.update({
      where: { id: params.id },
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        categoryId: data.categoryId,
        featuredImage: data.featuredImage,
        author: data.author,
        status: data.status,
        tags: data.tags,
        source: data.source,
        sourceUrl: data.sourceUrl,
        seoTitle: data.seoTitle,
        seoDesc: data.seoDesc,
        readingTime: data.readingTime,
      },
    })
    return NextResponse.json(article)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update article" }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { prisma } = await import("@/lib/prisma")
    await prisma.article.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete article" }, { status: 500 })
  }
}
