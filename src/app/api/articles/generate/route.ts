import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getRandomCategory, getNewsHeadline, writeArticle, generateArticleImage, generateSlug, getCategoryList } from "@/lib/auto-generate"
import { cookies } from "next/headers"

export const maxDuration = 60
export const dynamic = "force-dynamic"

function checkAdminAuth(): boolean {
  const cookieStore = cookies()
  const adminAuth = cookieStore.get("admin_auth_cookie")?.value
  const adminPassword = process.env.ADMIN_PASSWORD || "gta6admin2026"
  return adminAuth === adminPassword
}

export async function GET(req: Request) {
  if (!checkAdminAuth()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

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
