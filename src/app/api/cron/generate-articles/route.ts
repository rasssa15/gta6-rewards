import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getRandomCategory, getNewsHeadline, writeArticle, generateArticleImage, generateSlug, getCategoryList } from "@/lib/auto-generate"

export const maxDuration = 300
export const dynamic = "force-dynamic"

const CRON_SECRET = process.env.CRON_SECRET || ""
const ARTICLES_PER_RUN = 3

export async function GET(req: Request) {
  const auth = req.headers.get("authorization")?.replace("Bearer ", "")
  if (CRON_SECRET && auth !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const results: { title: string; slug: string; status: string }[] = []
  const errors: string[] = []

  for (let i = 0; i < ARTICLES_PER_RUN; i++) {
    try {
      const category = getRandomCategory()
      const headline = await getNewsHeadline(category)
      const article = await writeArticle(headline, category)
      const slug = generateSlug(article.title)
      const featuredImage = await generateArticleImage(article.title, category)

      await prisma.article.create({
        data: {
          title: article.title,
          slug,
          excerpt: article.excerpt || article.title,
          content: article.content,
          categoryId: category,
          featuredImage: featuredImage || "",
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

      results.push({ title: article.title, slug, status: "published" })
    } catch (e: any) {
      errors.push(e?.message || "Generation failed")
    }
  }

  return NextResponse.json({ generated: results.length, errors, results })
}
