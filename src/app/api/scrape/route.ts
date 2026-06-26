import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import Parser from "rss-parser"
import * as cheerio from "cheerio"
import slugify from "slugify"
import { cookies } from "next/headers"

function checkAdminAuth(): boolean {
  const cookieStore = cookies()
  const adminAuth = cookieStore.get("admin_auth_cookie")?.value
  const adminPassword = process.env.ADMIN_PASSWORD || "gta6admin2026"
  return adminAuth === adminPassword
}

const parser = new Parser()

const RSS_FEEDS = [
  "https://www.ign.com/rss/articles",
  "https://www.rockstargames.com/newswire/feed.xml",
  "https://www.gamespot.com/feeds/mashup",
  "https://www.pcgamer.com/rss",
]

async function fetchAndScrape(url: string) {
  try {
    const feed = await parser.parseURL(url)
    const articles = []

    for (const item of feed.items.slice(0, 5)) {
      if (!item.title || !item.link) continue

      const existing = await prisma.article.findFirst({
        where: { sourceUrl: item.link },
      })
      if (existing) continue

      let content = item.contentSnippet || item.content || ""
      let image = ""

      try {
        const res = await fetch(item.link, { headers: { "User-Agent": "Mozilla/5.0" } })
        const html = await res.text()
        const $ = cheerio.load(html)
        content = $("article").text() || $(".article-content").text() || $("main").text() || content
        image = $("meta[property='og:image']").attr("content") || $("img").first().attr("src") || ""
      } catch {}

      articles.push({
        title: item.title.trim(),
        slug: slugify(item.title.trim(), { lower: true, strict: true }) + "-" + Date.now(),
        excerpt: item.contentSnippet?.slice(0, 200) || "",
        content: content.slice(0, 10000),
        featuredImage: image,
        source: feed.title || "RSS",
        sourceUrl: item.link,
        status: "draft",
        tags: item.categories?.join(", ") || "",
        readingTime: Math.max(1, Math.ceil((content?.split(" ").length || 0) / 200)),
      })
    }

    return articles
  } catch (error) {
    return []
  }
}

export async function POST(req: NextRequest) {
  if (!checkAdminAuth()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { feeds } = await req.json()
    const urls = feeds && feeds.length > 0 ? feeds : RSS_FEEDS

    let allArticles: any[] = []
    for (const url of urls) {
      const articles = await fetchAndScrape(url)
      allArticles = allArticles.concat(articles)
    }

    let created = 0
    for (const article of allArticles) {
      try {
        await prisma.article.create({ data: article })
        created++
      } catch {}
    }

    return NextResponse.json({ scraped: allArticles.length, created })
  } catch (error) {
    return NextResponse.json({ error: "Scraping failed" }, { status: 500 })
  }
}

export async function GET() {
  if (!checkAdminAuth()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return NextResponse.json({ feeds: RSS_FEEDS })
}
