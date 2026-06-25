import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getRandomCategory, getNewsHeadline, writeArticle, generateArticleImage, generateSlug, getCategoryList } from "@/lib/auto-generate"

export const maxDuration = 60
export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const categoryParam = searchParams.get("category")

  try {
    const category = categoryParam && getCategoryList().includes(categoryParam)
      ? categoryParam
      : getRandomCategory()

    const headline = await getNewsHeadline(category)
    const article = await writeArticle(headline, category)
    const slug = generateSlug(article.title)

    const created = await prisma.article.create({
      data: {
        title: article.title,
        slug,
        excerpt: article.excerpt || article.title,
        content: article.content,
        categoryId: category,
        featuredImage: generateArticleImage(article.title, category),
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
