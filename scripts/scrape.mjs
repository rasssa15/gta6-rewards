import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, "..", "public", "data")
const TINYFISH_API_KEY = process.env.TINYFISH_API_KEY || ""

async function tinyfishSearch(query) {
  if (!TINYFISH_API_KEY) return null
  try {
    const res = await fetch(`https://api.search.tinyfish.ai?query=${encodeURIComponent(query)}&language=en`, {
      headers: { "X-API-Key": TINYFISH_API_KEY },
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.results || []
  } catch {
    return null
  }
}

async function tinyfishFetch(url) {
  if (!TINYFISH_API_KEY) return null
  try {
    const res = await fetch("https://api.fetch.tinyfish.ai", {
      method: "POST",
      headers: {
        "X-API-Key": TINYFISH_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ urls: [url] }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.results?.[0]?.markdown || data.results?.[0]?.text || null
  } catch {
    return null
  }
}

async function generateImage(prompt) {
  const FAL_KEY = process.env.FAL_KEY
  if (!FAL_KEY) return null
  try {
    const res = await fetch("https://fal.run/fal-ai/flux/schnell", {
      method: "POST",
      headers: {
        "Authorization": `Key ${FAL_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        image_size: "landscape_4_3",
        num_images: 1,
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    if (data.images?.[0]?.url) {
      const imgRes = await fetch(data.images[0].url)
      const buf = Buffer.from(await imgRes.arrayBuffer())
      return buf.toString("base64")
    }
    return null
  } catch {
    return null
  }
}

const now = new Date()
const today = now.toISOString().slice(0, 10)
const dateLabel = `${now.toLocaleString("en-US", { month: "long" })} ${now.getDate()}, ${now.getFullYear()}`

const CATEGORIES = [
  { id: "gta-6", search: `GTA 6 news ${today}` , keywords: "GTA 6, Grand Theft Auto VI, Vice City" },
  { id: "rockstar", search: `Rockstar Games latest news ${today}`, keywords: "Rockstar Games, Take-Two, Red Dead Redemption" },
  { id: "playstation", search: `PlayStation PS5 news ${today}`, keywords: "PlayStation, PS5, PS5 Pro, Sony gaming" },
  { id: "xbox", search: `Xbox news ${today}`, keywords: "Xbox, Xbox Series X, Xbox Game Pass" },
  { id: "pc-gaming", search: `PC gaming news ${today}`, keywords: "PC gaming, Steam, NVIDIA, AMD" },
  { id: "nintendo", search: `Nintendo news ${today}`, keywords: "Nintendo, Switch, Mario, Zelda" },
  { id: "esports", search: `esports news ${today}`, keywords: "Esports, competitive gaming, tournaments" },
]

let prisma = null
async function getPrisma() {
  if (prisma) return prisma
  try {
    const { PrismaClient } = await import("@prisma/client")
    prisma = new PrismaClient()
    await prisma.$connect()
    console.log("  Connected to database")
    return prisma
  } catch {
    console.log("  No database available, saving to JSON only")
    return null
  }
}

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16)
  })
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80)
}

function loadCategory(cat) {
  const path = join(DATA_DIR, `articles-${cat}.json`)
  if (!existsSync(path)) return []
  try { return JSON.parse(readFileSync(path, "utf8")) } catch { return [] }
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

function isDuplicate(article, existingArticles) {
  return existingArticles.some(a => a.sourceUrl === article.sourceUrl || a.title === article.title)
}

const FALLBACK_CONTENT = {
  intro: `As of ${dateLabel}, the gaming community is buzzing with excitement following the latest developments. This breaking news has captured the attention of players worldwide, with discussions heating up across social media platforms, gaming forums, and community channels.`,
  body1: `Industry analysts have been quick to weigh in on the significance of this development, noting that it arrives at a pivotal moment for the gaming industry. The current landscape is characterized by rapid technological advancement, shifting player expectations, and intense competition among major publishers and platform holders.`,
  body2: `Sources close to the situation have indicated that this development represents a significant milestone that could have far-reaching implications for how players experience their favorite franchises in the coming months and years. The details that have emerged thus far paint a picture of ambitious planning and execution.`,
  body3: `The response from the community has been overwhelmingly positive, with fans expressing enthusiasm about what this means for the future of their favorite gaming experiences. Many have taken to social media to share their reactions, theories, and hopes for what comes next.`,
  body4: `As with any major gaming news story, it is important to note that some details may still be subject to change as official announcements and confirmations emerge. The gaming industry moves quickly, and the information landscape can shift rapidly.`,
  body5: `For those who want to stay up to date with this developing story, following official social media channels, trusted gaming news outlets, and community discussion hubs is the best way to ensure you do not miss any important updates.`,
  outro: `This announcement serves as yet another reminder of the dynamic and ever-evolving nature of the interactive entertainment industry, where innovation, creativity, and player engagement continue to drive the medium forward.`,
}

function buildArticle(title, sourceContent) {
  const paragraphs = sourceContent
    ? sourceContent.split("\n").filter(l => l.trim()).slice(0, 10).map(l => `<p>${l.trim().slice(0, 500)}</p>`)
    : [
        `<p>${FALLBACK_CONTENT.intro}</p>`,
        `<h2>What We Know So Far</h2>`,
        `<p>${FALLBACK_CONTENT.body1}</p>`,
        `<p>${FALLBACK_CONTENT.body2}</p>`,
        `<h2>Community Response</h2>`,
        `<p>${FALLBACK_CONTENT.body3}</p>`,
        `<h2>Looking Ahead</h2>`,
        `<p>${FALLBACK_CONTENT.body4}</p>`,
        `<p>${FALLBACK_CONTENT.body5}</p>`,
        `<p>${FALLBACK_CONTENT.outro}</p>`,
      ]

  const fullText = paragraphs.join(" ")
  return {
    title,
    content: paragraphs.join("\n"),
    excerpt: paragraphs[0].replace(/<[^>]+>/g, "").slice(0, 155),
    readingTime: Math.max(3, Math.ceil(fullText.split(" ").length / 200)),
  }
}

async function searchTrendingTopics(category) {
  console.log(`  Searching TinyFish for: "${category.search}"`)
  const results = await tinyfishSearch(category.search)
  if (results && results.length > 0) {
    const top = results.slice(0, 5)
    const topic = top[Math.floor(Math.random() * top.length)]
    let sourceContent = null
    if (topic.url) {
      console.log(`  Fetching article: ${topic.url}`)
      sourceContent = await tinyfishFetch(topic.url)
    }
    return {
      topic: topic.title,
      description: topic.snippet || topic.title,
      sourceUrl: topic.url,
      sourceContent,
      imagePrompt: `${topic.title} gaming news screenshot style, cinematic`,
    }
  }

  const fallbackTopics = {
    "gta-6": "GTA 6 Vice City Gameplay Reveal",
    rockstar: "Rockstar Games New Project Update",
    playstation: "PlayStation 5 Pro Launch Details",
    xbox: "Xbox Game Pass New Additions",
    "pc-gaming": "Next Gen PC Hardware Releases",
    nintendo: "Nintendo Switch 2 Development News",
    esports: "Major Esports Tournament Announcement",
  }
  const topic = fallbackTopics[category.id] || "Gaming Industry Update"
  return {
    topic,
    description: `Latest news about ${topic}`,
    sourceUrl: "",
    sourceContent: null,
    imagePrompt: `${topic} gaming news screenshot style, cinematic`,
  }
}

async function scrape() {
  console.log("Starting scraper (TinyFish search + fallback writing)...")
  const db = await getPrisma()
  let totalNew = 0

  for (const category of CATEGORIES) {
    console.log(`\n=== Category: ${category.id} ===`)
    const existingArticles = loadCategory(category.id)
    console.log(`  Existing articles: ${existingArticles.length}`)

    const topic = await searchTrendingTopics(category)
    if (!topic) continue
    console.log(`  Topic: ${topic.topic}`)

    const article = {
      id: uuid(),
      title: topic.topic,
      slug: slugify(topic.topic) + "-" + Date.now(),
      excerpt: topic.description.slice(0, 200),
      content: topic.description,
      categoryId: category.id,
      categorySlug: category.id,
      categoryName: category.id.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
      featuredImage: "",
      prices: "",
      author: "GTA 6 Rewards",
      status: "published",
      viewCount: 0,
      readingTime: 3,
      tags: category.id,
      metaTitle: topic.topic.slice(0, 60),
      metaDescription: topic.description.slice(0, 160),
      keywords: category.keywords,
      createdAt: new Date().toISOString(),
      source: topic.sourceUrl ? "TinyFish" : "AI Generated",
      sourceUrl: topic.sourceUrl || "",
    }

    if (isDuplicate(article, existingArticles)) {
      console.log(`  Skipping (exists): ${topic.topic}`)
      continue
    }

    console.log(`  Building article...`)
    const rewritten = buildArticle(topic.topic, topic.sourceContent)
    article.title = rewritten.title || article.title
    article.content = rewritten.content || article.content
    article.excerpt = rewritten.excerpt || article.excerpt.slice(0, 160)
    article.readingTime = rewritten.readingTime || Math.max(1, Math.ceil(article.content.split(" ").length / 200))

    if (topic.imagePrompt) {
      console.log(`  Generating image...`)
      const imgData = await generateImage(topic.imagePrompt)
      if (imgData) {
        const imgPath = join(DATA_DIR, "..", "images", "articles", `${article.slug}.png`)
        if (!existsSync(dirname(imgPath))) mkdirSync(dirname(imgPath), { recursive: true })
        writeFileSync(imgPath, Buffer.from(imgData, "base64"))
        article.featuredImage = `/images/articles/${article.slug}.png`
        console.log(`  Image saved: ${article.slug}.png`)
      }
    }

    existingArticles.push(article)
    saveCategory(category.id, deduplicate(existingArticles))

    if (db) {
      try {
        const dbCat = await db.category.findUnique({ where: { slug: category.id } })
        if (!dbCat) {
          console.log(`  DB save skipped: category "${category.id}" not found in DB`)
        } else {
          await db.article.create({
            data: {
              title: article.title,
              slug: article.slug,
              excerpt: article.excerpt,
              content: article.content,
              categoryId: dbCat.id,
              featuredImage: article.featuredImage,
              author: article.author,
              status: article.status,
              tags: article.tags,
              source: article.source,
              sourceUrl: article.sourceUrl,
              seoTitle: article.metaTitle,
              seoDesc: article.metaDescription,
              readingTime: article.readingTime,
            },
          })
          console.log(`  Saved to DB: ${article.title}`)
        }
      } catch (e) {
        console.log(`  DB save failed: ${e.message}`)
      }
    }

    totalNew++
    console.log(`  Created: ${article.title} (${category.id})`)
  }

  if (db) await db.$disconnect()
  console.log(`\nDone. Created ${totalNew} new articles.`)
}

scrape().catch(async (err) => {
  console.error(err)
  if (prisma) await prisma.$disconnect()
  process.exit(1)
})
