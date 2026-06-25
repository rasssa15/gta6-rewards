import { NextRequest, NextResponse } from "next/server"
import { getArticles, getAllArticles, getArticleChunk, ArticleData } from "@/lib/data"

async function getDbArticles(options: {
  category?: string
  search?: string
  limit?: number
  offset?: number
}): Promise<{ articles: ArticleData[]; total: number }> {
  const { category, search, limit = 20, offset = 0 } = options
  try {
    const { prisma } = await import("@/lib/prisma")
    const where: any = { status: "published" }
    if (category) where.categoryId = category
    if (search) where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { tags: { contains: search, mode: "insensitive" } },
    ]

    const [rows, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.article.count({ where }),
    ])

    const articles = rows.map((a: any) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt,
      content: a.content,
      categoryId: a.categoryId || "",
      categorySlug: a.category?.slug || "",
      categoryName: a.category?.name || "",
      featuredImage: a.featuredImage,
      prices: a.prices,
      author: a.author,
      status: a.status,
      viewCount: a.viewCount,
      readingTime: a.readingTime,
      tags: a.tags,
      metaTitle: a.seoTitle,
      metaDescription: a.seoDesc,
      keywords: "",
      createdAt: a.createdAt.toISOString(),
    }))

    return { articles, total }
  } catch {
    return { articles: [], total: 0 }
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category")
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50)
  const offset = parseInt(searchParams.get("offset") || "0")
  const search = searchParams.get("search")

  try {
    const jsonResult = getArticles({ category: category || undefined, search: search || undefined, limit, offset })
    const dbResult = await getDbArticles({ category: category || undefined, search: search || undefined, limit, offset })

    const merged = mergeAndDedup(jsonResult.articles, dbResult.articles)
    const total = jsonResult.total + dbResult.total

    return NextResponse.json({ articles: merged, total, limit, offset })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch articles" }, { status: 500 })
  }
}

function mergeAndDedup(json: ArticleData[], db: ArticleData[]): ArticleData[] {
  const seen = new Set<string>()
  const result: ArticleData[] = []
  for (const a of [...db, ...json]) {
    if (!seen.has(a.slug)) {
      seen.add(a.slug)
      result.push(a)
    }
  }
  return result
}
