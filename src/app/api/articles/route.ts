import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category")
  const status = searchParams.get("status") || "published"
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50)
  const offset = parseInt(searchParams.get("offset") || "0")
  const search = searchParams.get("search")

  try {
    const where: any = { status }
    if (category) where.category = { slug: category }
    if (search) where.title = { contains: search, mode: "insensitive" }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.article.count({ where }),
    ])

    return NextResponse.json({ articles, total, limit, offset })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch articles" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    if (!data.title || !data.slug) {
      return NextResponse.json({ error: "title and slug required" }, { status: 400 })
    }

    const article = await prisma.article.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || "",
        content: data.content || "",
        categoryId: data.categoryId || null,
        featuredImage: data.featuredImage || "",
        author: data.author || "GTA 6 Rewards",
        status: data.status || "draft",
        tags: data.tags || "",
        source: data.source || "",
        sourceUrl: data.sourceUrl || "",
        seoTitle: data.seoTitle || "",
        seoDesc: data.seoDesc || "",
        readingTime: data.readingTime || 3,
      },
    })

    return NextResponse.json(article, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create article" }, { status: 500 })
  }
}
