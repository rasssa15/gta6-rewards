import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, "..", "public", "data")

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ""
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free"
const TINYFISH_API_KEY = process.env.TINYFISH_API_KEY || ""

async function openrouterChat(messages, options = {}) {
  if (!OPENROUTER_API_KEY) return null
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: options.model || OPENROUTER_MODEL,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 8192,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    console.log(`  OpenRouter error (${res.status}): ${err.slice(0, 200)}`)
    return null
  }
  const data = await res.json()
  return data.choices?.[0]?.message?.content || null
}

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

const CATEGORIES = [
  { id: "gta-6", search: "GTA 6 news leaks 2026", keywords: "GTA 6, Grand Theft Auto VI, Vice City" },
  { id: "rockstar", search: "Rockstar Games news 2026", keywords: "Rockstar Games, Take-Two, Red Dead Redemption" },
  { id: "playstation", search: "PlayStation PS5 news 2026", keywords: "PlayStation, PS5, PS5 Pro, Sony gaming" },
  { id: "xbox", search: "Xbox news 2026", keywords: "Xbox, Xbox Series X, Xbox Game Pass" },
  { id: "pc-gaming", search: "PC gaming news 2026", keywords: "PC gaming, Steam, NVIDIA, AMD" },
  { id: "nintendo", search: "Nintendo Switch news 2026", keywords: "Nintendo, Switch, Mario, Zelda" },
  { id: "esports", search: "esports tournaments news 2026", keywords: "Esports, competitive gaming, tournaments" },
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

const FALLBACK_TOPICS = {
  "gta-6": [
    { topic: "GTA 6 Leak Reveals New Gameplay Mechanics in Vice City", description: "Fresh leaks reveal exciting new gameplay mechanics coming to GTA 6's Vice City.", imagePrompt: "GTA 6 Vice City neon skyline at sunset with palm trees, cinematic game screenshot style" },
    { topic: "Rockstar Confirms GTA 6 Map Size Details", description: "Rockstar Games has reportedly finalized the GTA 6 map design, significantly larger than any previous entry.", imagePrompt: "Aerial view of massive game map with cities and countryside, GTA style" },
  ],
  rockstar: [
    { topic: "Rockstar Games Announces Major Update for GTA Online", description: "Rockstar Games has unveiled plans for a massive GTA Online update with new missions, vehicles, and properties.", imagePrompt: "GTA Online heist crew in tactical gear, explosive action scene" },
  ],
  playstation: [
    { topic: "PlayStation 5 Pro Specs and Release Date Rumors Surface", description: "Latest PS5 Pro rumors point to significant hardware upgrades with ray tracing improvements and 8K support.", imagePrompt: "PS5 Pro console concept design with blue LED lighting" },
  ],
  xbox: [
    { topic: "Xbox Game Pass Adds Major Third-Party Titles", description: "Xbox Game Pass continues to expand with several major third-party titles joining the subscription service.", imagePrompt: "Xbox green neon logo on dark background with game boxes floating" },
  ],
  "pc-gaming": [
    { topic: "PC Gaming Hardware Sales Surge Globally", description: "PC gaming hardware sales are experiencing a global surge as gamers upgrade their systems.", imagePrompt: "High-end gaming PC with RGB lighting, glass side panel" },
  ],
  nintendo: [
    { topic: "Nintendo Switch 2 Backward Compatibility Details", description: "New details about Nintendo's next console suggest full backward compatibility with existing Switch games.", imagePrompt: "Nintendo Switch 2 concept design with colorful Joy-Cons" },
  ],
  esports: [
    { topic: "Esports Tournament Prize Pools Reach Record Levels", description: "Esports tournament prize pools have reached unprecedented levels in 2026.", imagePrompt: "Massive esports arena with crowd cheering, stage with trophy, neon lights" },
  ],
}

function buildFallbackArticle(title) {
  const paragraphs = [
    `<p>The gaming community is buzzing with excitement following the latest developments surrounding ${title.toLowerCase()}. This breaking news has captured the attention of players worldwide, with discussions already heating up across social media platforms, gaming forums, and community channels dedicated to tracking every detail of this evolving story.</p>`,
    `<p>Industry analysts have been quick to weigh in on the significance of this development, noting that it arrives at a pivotal moment for the gaming industry. The current landscape is characterized by rapid technological advancement, shifting player expectations, and intense competition among major publishers and platform holders, making any major announcement particularly consequential.</p>`,
    `<p>Sources close to the situation have indicated that this development represents a significant milestone that could have far-reaching implications for how players experience their favorite franchises in the coming months and years. The details that have emerged thus far paint a picture of ambitious planning and execution by the teams involved.</p>`,
    `<p>The response from the community has been overwhelmingly positive, with fans expressing enthusiasm about what this means for the future of their favorite gaming experiences. Many have taken to social media to share their reactions, theories, and hopes for what comes next, creating a groundswell of engagement that developers are sure to be monitoring closely.</p>`,
    `<p>As with any major gaming news story, it is important to note that some details may still be subject to change as official announcements and confirmations emerge. The gaming industry moves quickly, and the information landscape can shift rapidly as new details come to light through official channels and verified sources.</p>`,
    `<p>For those who want to stay up to date with this developing story, following official social media channels, trusted gaming news outlets, and community discussion hubs is the best way to ensure you do not miss any important updates. The GTA 6 Rewards team will continue to monitor this story and provide comprehensive coverage as new information becomes available to the public.</p>`,
    `<p>This announcement serves as yet another reminder of the dynamic and ever-evolving nature of the interactive entertainment industry, where innovation, creativity, and player engagement continue to drive the medium forward. The coming weeks and months promise to bring even more exciting developments that will shape the future of gaming for years to come.</p>`,
  ]
  return {
    title,
    content: paragraphs.join("\n"),
    excerpt: paragraphs[0].replace(/<[^>]+>/g, "").slice(0, 155),
    readingTime: Math.max(3, Math.ceil(paragraphs.join(" ").split(" ").length / 200)),
    imageData: null,
  }
}

async function fetchArticleContent(url) {
  const content = await tinyfishFetch(url)
  if (content) return content
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; GTARewardsBot/1.0)" },
      signal: AbortSignal.timeout(10000),
    })
    const html = await res.text()
    const match = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i)
      || html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)
      || html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
    if (match) return match[1].replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "").replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "").slice(0, 5000)
    return html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "").slice(0, 5000)
  } catch {
    return null
  }
}

async function searchTrendingTopics(category) {
  console.log(`  Searching TinyFish for: "${category.search}"`)
  const results = await tinyfishSearch(category.search)
  if (results && results.length > 0) {
    const top = results.slice(0, 3)
    const topic = top[Math.floor(Math.random() * Math.min(top.length, 3))]
    let sourceContent = null
    if (topic.url) {
      console.log(`  Fetching article: ${topic.url}`)
      sourceContent = await fetchArticleContent(topic.url)
    }
    return {
      topic: topic.title,
      description: topic.snippet || topic.title,
      sourceUrl: topic.url,
      sourceContent,
      imagePrompt: `${topic.title} gaming news screenshot style, cinematic`,
    }
  }

  const fallbacks = FALLBACK_TOPICS[category.id] || FALLBACK_TOPICS["gta-6"]
  const fallback = fallbacks[Math.floor(Math.random() * fallbacks.length)]
  console.log(`  Using fallback topic: ${fallback.topic}`)
  return {
    topic: fallback.topic,
    description: fallback.description,
    sourceUrl: "",
    sourceContent: null,
    imagePrompt: fallback.imagePrompt,
  }
}

async function rewriteArticle(title, sourceContent, category) {
  const systemMsg = `You are a professional gaming journalist writing for GTA 6 Rewards. Respond with valid JSON only.`

  const userMsg = `Write a gaming news article about "${title}" for category "${category}".

${sourceContent ? `SOURCE MATERIAL (use this for facts, rewrite in your own words):\n${sourceContent.slice(0, 6000)}` : "Write an original article based on general gaming knowledge."}

Requirements:
- 800-1500 words of unique, engaging HTML content
- Use <h2> for subheadings, <p> for paragraphs
- Gaming-community tone: exciting, informed
- SEO-friendly
- Do NOT attribute to any source
- Write as original journalism

Return JSON:
{
  "title": "Optimized SEO headline",
  "content": "Full HTML content with <p> and <h2> tags",
  "excerpt": "1-2 sentence summary (max 160 chars)",
  "readingTime": number (minutes)
}

Only return valid JSON, no markdown.`

  try {
    const result = await openrouterChat([
      { role: "system", content: systemMsg },
      { role: "user", content: userMsg },
    ], { temperature: 0.7, max_tokens: 8192 })
    if (!result) throw new Error("Empty response")
    const cleaned = result.replace(/```json|```/g, "").trim()
    return JSON.parse(cleaned)
  } catch (e) {
    console.log(`  Rewrite failed: ${e.message}, using fallback`)
    return buildFallbackArticle(title)
  }
}

async function scrape() {
  console.log("Starting scraper (TinyFish search + OpenRouter writing)...")
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
      source: topic.sourceUrl ? "TinyFish Search" : "AI Generated",
      sourceUrl: topic.sourceUrl || "",
    }

    if (isDuplicate(article, existingArticles)) {
      console.log(`  Skipping (exists): ${topic.topic}`)
      continue
    }

    console.log(`  Rewriting article with LLM...`)
    const rewritten = await rewriteArticle(topic.topic, topic.sourceContent, category.id)
    if (rewritten) {
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
