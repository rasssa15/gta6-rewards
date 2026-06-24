import Parser from "rss-parser"
import * as cheerio from "cheerio"
import slugify from "slugify"

const API_URL = process.env.API_URL || "http://localhost:3000"

const DEFAULT_FEEDS = [
  "https://www.ign.com/rss/articles",
  "https://www.rockstargames.com/newswire/feed.xml",
  "https://www.gamespot.com/feeds/mashup",
  "https://www.pcgamer.com/rss",
  "https://www.vg247.com/feed",
]

async function scrape() {
  console.log("Starting scraper...")

  const settingsRes = await fetch(`${API_URL}/api/settings`).catch(() => null)
  let feeds = DEFAULT_FEEDS
  let autoPublish = false
  let geminiKey = ""

  if (settingsRes?.ok) {
    const settings = await settingsRes.json()
    if (settings.rss_feeds) feeds = settings.rss_feeds.split("\n").filter(Boolean)
    autoPublish = settings.auto_publish === "true"
    geminiKey = settings.gemini_api_key || ""
  }

  const parser = new Parser()
  let total = 0

  for (const feedUrl of feeds) {
    try {
      const feed = await parser.parseURL(feedUrl.trim())
      console.log(`Processing: ${feed.title || feedUrl}`)

      for (const item of feed.items.slice(0, 5)) {
        if (!item.title || !item.link) continue

        const checkRes = await fetch(`${API_URL}/api/articles?search=${encodeURIComponent(item.title)}&limit=1`)
        const checkData = await checkRes.json()
        if (checkData.articles?.length > 0) {
          console.log(`  Skipping (exists): ${item.title}`)
          continue
        }

        let content = item.contentSnippet || item.content || ""
        let image = ""

        try {
          const res = await fetch(item.link, {
            headers: { "User-Agent": "Mozilla/5.0 (compatible; GTARewards/1.0)" },
            timeout: 10000,
          })
          const html = await res.text()
          const $ = cheerio.load(html)
          content = $("article").text() || $(".article-content").text() || $('[role="main"]').text() || content
          image = $('meta[property="og:image"]').attr("content") || $("img").first().attr("src") || ""
          content = content.slice(0, 10000)
        } catch (e) {
          console.log(`  Scrape failed for ${item.link}, using RSS snippet`)
        }

        let rewritten = {
          title: item.title.trim(),
          content,
          seoTitle: item.title.trim(),
          seoDesc: (item.contentSnippet || "").slice(0, 160),
          tags: feed.title || "gaming",
          readingTime: Math.max(1, Math.ceil((content.split(" ").length || 0) / 200)),
        }

        if (geminiKey) {
          try {
            const { GoogleGenerativeAI } = await import("@google/generative-ai")
            const genAI = new GoogleGenerativeAI(geminiKey)
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
            const prompt = `Rewrite this gaming article for GTA 6 Rewards platform. Engaging, conversational, keep facts. Return JSON with title, content, seoTitle, seoDesc, tags, readingTime.

Title: ${rewritten.title}
Content: ${content.slice(0, 3000)}`

            const result = await model.generateContent(prompt)
            const text = result.response.text()
            const cleaned = text.replace(/```json\s*/g, "").replace(/```/g, "").trim()
            try { rewritten = { ...rewritten, ...JSON.parse(cleaned) } } catch {}
          } catch (e) {
            console.log("  Gemini rewrite skipped")
          }
        }

        const articleData = {
          title: rewritten.title,
          slug: slugify(rewritten.title, { lower: true, strict: true }) + "-" + Date.now(),
          excerpt: rewritten.seoDesc.slice(0, 200),
          content: rewritten.content,
          featuredImage: image,
          status: autoPublish ? "published" : "draft",
          tags: rewritten.tags,
          readingTime: rewritten.readingTime,
          source: feed.title || "RSS",
          sourceUrl: item.link,
          seoTitle: rewritten.seoTitle,
          seoDesc: rewritten.seoDesc,
        }

        const createRes = await fetch(`${API_URL}/api/articles`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(articleData),
        })

        if (createRes.ok) {
          total++
          console.log(`  Created: ${articleData.title} (${autoPublish ? "published" : "draft"})`)
        } else {
          console.log(`  Failed: ${articleData.title}`)
        }
      }
    } catch (e) {
      console.log(`Error processing feed ${feedUrl}: ${e.message}`)
    }
  }

  console.log(`Done. Created ${total} articles.`)
}

scrape().catch(console.error)
