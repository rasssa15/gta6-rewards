import Parser from "rss-parser"
import * as cheerio from "cheerio"
import slugify from "slugify"
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, "..", "public", "data")

const CATEGORY_MAP = {
  "rockstargames.com": "rockstar",
  "ign.com": "gta-6",
  "gamespot.com": "gta-6",
  "pcgamer.com": "pc-gaming",
  "vg247.com": "gta-6",
}

const KEYWORD_CATEGORY = {
  "gta": "gta-6",
  "grand theft auto": "gta-6",
  "rockstar": "rockstar",
  "xbox": "xbox",
  "playstation": "playstation",
  "sony": "playstation",
  "ps5": "playstation",
  "nintendo": "nintendo",
  "switch": "nintendo",
  "pc gaming": "pc-gaming",
  "steam": "pc-gaming",
  "esports": "esports",
  "competitive": "esports",
}

const CATEGORIES = ["gta-6", "rockstar", "playstation", "xbox", "pc-gaming", "nintendo", "esports"]
const DEFAULT_FEEDS = [
  "https://www.ign.com/rss/articles",
  "https://www.rockstargames.com/newswire/feed.xml",
  "https://www.gamespot.com/feeds/mashup",
  "https://www.pcgamer.com/rss",
  "https://www.vg247.com/feed",
]

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16)
  })
}

function detectCategory(feedUrl, title, content) {
  const host = new URL(feedUrl).hostname.replace("www.", "")
  if (CATEGORY_MAP[host]) return CATEGORY_MAP[host]
  const text = `${title} ${content}`.toLowerCase()
  for (const [keyword, cat] of Object.entries(KEYWORD_CATEGORY)) {
    if (text.includes(keyword)) return cat
  }
  return "gta-6"
}

function loadCategory(cat) {
  const path = join(DATA_DIR, `articles-${cat}.json`)
  if (!existsSync(path)) return []
  return JSON.parse(readFileSync(path, "utf8"))
}

function saveCategory(cat, articles) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
  const path = join(DATA_DIR, `articles-${cat}.json`)
  writeFileSync(path, JSON.stringify(articles, null, 2))
  console.log(`  Saved ${articles.length} articles to articles-${cat}.json`)
}

function deduplicate(articles) {
  const seen = new Set()
  return articles.filter(a => {
    const key = a.slug || a.sourceUrl || a.title
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

async function scrape() {
  console.log("Starting scraper...")

  const parser = new Parser()
  let totalNew = 0

  for (const feedUrl of DEFAULT_FEEDS) {
    try {
      const feed = await parser.parseURL(feedUrl.trim())
      console.log(`\nProcessing: ${feed.title || feedUrl}`)

      for (const item of feed.items.slice(0, 5)) {
        if (!item.title || !item.link) continue

        let content = item.contentSnippet || item.content || ""
        let image = ""

        try {
          const res = await fetch(item.link, {
            headers: { "User-Agent": "Mozilla/5.0 (compatible; GTARewards/1.0)" },
            signal: AbortSignal.timeout(10000),
          })
          const html = await res.text()
          const $ = cheerio.load(html)
          content = $("article").text() || $(".article-content").text() || $('[role="main"]').text() || content
          image = $('meta[property="og:image"]').attr("content") || $("img").first().attr("src") || ""
          content = content.slice(0, 10000)
        } catch (e) {
          console.log(`  Scrape failed for ${item.link}, using RSS snippet`)
        }

        const category = detectCategory(feedUrl, item.title, content)
        const slug = slugify(item.title, { lower: true, strict: true }) + "-" + Date.now()

        const article = {
          id: uuid(),
          title: item.title.trim(),
          slug,
          excerpt: (item.contentSnippet || content).slice(0, 200),
          content,
          categoryId: category,
          categorySlug: category,
          categoryName: category.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
          featuredImage: image,
          prices: "",
          author: feed.title || "RSS",
          status: "draft",
          viewCount: 0,
          readingTime: Math.max(1, Math.ceil(content.split(" ").length / 200)),
          tags: feed.title || "gaming",
          metaTitle: item.title.trim().slice(0, 60),
          metaDescription: (item.contentSnippet || "").slice(0, 160),
          keywords: "",
          createdAt: new Date().toISOString(),
          source: feed.title || "RSS",
          sourceUrl: item.link,
        }

        const existingArticles = loadCategory(category)
        const isDuplicate = existingArticles.some(
          a => a.sourceUrl === item.link || a.title === item.title
        )
        if (isDuplicate) {
          console.log(`  Skipping (exists): ${item.title}`)
          continue
        }

        existingArticles.push(article)
        saveCategory(category, deduplicate(existingArticles))
        totalNew++
        console.log(`  Created: ${article.title} (${category}, draft)`)
      }
    } catch (e) {
      console.log(`Error processing feed ${feedUrl}: ${e.message}`)
    }
  }

  console.log(`\nDone. Created ${totalNew} new articles.`)
}

scrape().catch(console.error)
