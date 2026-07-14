import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getRandomCategory, getNewsHeadline, writeArticle, generateArticleImage, generateSlug, getCategoryList } from "@/lib/auto-generate"
import { checkAdminAuth } from "@/lib/admin-auth"
import { checkRateLimit } from "@/lib/rate-limit"

export const maxDuration = 60
export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  if (!checkAdminAuth()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown"
  const { allowed, resetAt } = checkRateLimit(ip, "GET", "/api/articles/generate")
  if (!allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)), "X-RateLimit-Remaining": "0" } }
    )
  }

  const { searchParams } = new URL(req.url)
  const categoryParam = searchParams.get("category")

  try {
    const categorySlug = categoryParam && getCategoryList().includes(categoryParam)
      ? categoryParam
      : getRandomCategory()

    const category = await prisma.category.findUnique({ where: { slug: categorySlug } })
    if (!category) {
      return NextResponse.json({ success: false, error: "Category not found in database" }, { status: 400 })
    }

    const headline = await getNewsHeadline(categorySlug)
    const article = await writeArticle(headline, categorySlug)
    const slug = generateSlug(article.title)

    const created = await prisma.article.create({
      data: {
        title: article.title,
        slug,
        excerpt: article.excerpt || article.title,
        content: article.content,
        categoryId: category.id,
        featuredImage: await generateArticleImage(article.title, categorySlug),
        author: "GTA 6 Rewards AI",
        status: "published",
        tags: article.tags,
        source: "AI Generated",
        sourceUrl: "",
        seoTitle: article.title.slice(0, 60),
        seoDesc: (article.excerpt || article.title).slice(0, 160),
        readingTime: article.readingTime || 3,
      },
    })

    return NextResponse.json({
      success: true,
      article: {
        id: created.id,
        title: created.title,
        slug: created.slug,
        category,
        createdAt: created.createdAt,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Generation failed" },
      { status: 500 }
    )
  }
}
