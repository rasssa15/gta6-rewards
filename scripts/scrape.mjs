import Parser from "rss-parser"
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { GoogleGenerativeAI } from "@google/generative-ai"

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, "..", "public", "data")

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

const CATEGORIES = [
  { id: "gta-6", keywords: "GTA 6, Grand Theft Auto VI, Vice City, GTA 6 leaks, GTA 6 news" },
  { id: "rockstar", keywords: "Rockstar Games, Take-Two, Red Dead Redemption, Rockstar news" },
  { id: "playstation", keywords: "PlayStation, PS5, PS5 Pro, Sony gaming, PlayStation Plus" },
  { id: "xbox", keywords: "Xbox, Xbox Series X, Xbox Game Pass, Microsoft gaming, Xbox news" },
  { id: "pc-gaming", keywords: "PC gaming, Steam, NVIDIA, AMD, gaming hardware, PC games" },
  { id: "nintendo", keywords: "Nintendo, Switch 2, Mario, Zelda, Nintendo news" },
  { id: "esports", keywords: "Esports, competitive gaming, tournaments, Valorant, CS2, League of Legends" },
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
  } catch (e) {
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

function isDuplicate(article, existingArticles, db) {
  if (existingArticles.some(a => a.sourceUrl === article.sourceUrl || a.title === article.title)) return true
  return false
}

const FALLBACK_TOPICS = {
  "gta-6": [
    { topic: "GTA 6 Leak Reveals New Gameplay Mechanics in Vice City", description: "Fresh leaks from the GTA 6 development community reveal exciting new gameplay mechanics coming to Vice City. Sources close to Rockstar Games indicate the team is implementing revolutionary systems that will change how players interact with the open world.", imagePrompt: "GTA 6 Vice City neon skyline at sunset with palm trees, cinematic game screenshot style" },
    { topic: "Rockstar Confirms GTA 6 Map Size Details", description: "Rockstar Games has reportedly finalized the GTA 6 map design, with insiders claiming it will be significantly larger than any previous entry. The map is said to span multiple cities and diverse biomes.", imagePrompt: "Aerial view of massive game map with cities and countryside, GTA style" },
    { topic: "GTA 6 Storyline Rumors: Multiple Protagonists Return", description: "New rumors suggest GTA 6 will feature multiple protagonists similar to GTA V, with interconnected storylines set in a modern-day Vice City. Fans are speculating about character reveals.", imagePrompt: "Three mysterious silhouettes standing back to back, Vice City skyline behind, cinematic lighting" },
  ],
  rockstar: [
    { topic: "Rockstar Games Announces Major Update for GTA Online", description: "Rockstar Games has unveiled plans for a massive GTA Online update that promises to expand the multiplayer experience with new missions, vehicles, and properties.", imagePrompt: "GTA Online heist crew in tactical gear, explosive action scene" },
    { topic: "Rockstar's Next-Gen RAGE Engine Details Revealed", description: "Technical details about Rockstar's next-generation RAGE engine have emerged, showcasing groundbreaking physics, lighting, and AI systems.", imagePrompt: "Game engine wireframe rendering of detailed cityscape at night" },
    { topic: "Rockstar Hiring for Unannounced Open World Project", description: "Rockstar is actively hiring for a mysterious unannounced open-world project, fueling speculation about their next major franchise or a new IP entirely.", imagePrompt: "Modern game studio office with developers working, blue neon lighting" },
  ],
  playstation: [
    { topic: "PlayStation 5 Pro Specs and Release Date Rumors Surface", description: "The latest PlayStation 5 Pro rumors point to a significant hardware upgrade with ray tracing improvements and 8K support, potentially launching this holiday season.", imagePrompt: "PS5 Pro console concept design with blue LED lighting, sleek futuristic look" },
    { topic: "Sony Secures Major Third-Party Exclusives for 2025", description: "Sony has reportedly secured exclusive deals for several major third-party titles coming to PlayStation platforms throughout 2025 and beyond.", imagePrompt: "PlayStation logo with silhouette of game characters, dramatic lighting" },
  ],
  xbox: [
    { topic: "Xbox Game Pass Adds Major Third-Party Titles", description: "Microsoft's Xbox Game Pass continues to expand with several major third-party titles joining the subscription service this month.", imagePrompt: "Xbox green neon logo on dark background with game boxes floating" },
    { topic: "Microsoft Teases Next-Gen Xbox Hardware Plans", description: "Microsoft has offered glimpses into their next-generation Xbox hardware strategy, focusing on cloud integration and cross-platform play.", imagePrompt: "Futuristic Xbox console prototype with green neon accents, concept art" },
  ],
  "pc-gaming": [
    { topic: "PC Gaming Hardware Sales Surge Globally", description: "PC gaming hardware sales are experiencing a global surge as gamers upgrade their systems for upcoming titles. GPU and CPU sales have seen unprecedented growth this quarter.", imagePrompt: "High-end gaming PC with RGB lighting, glass side panel, gaming setup" },
    { topic: "NVIDIA and AMD Battle for GPU Supremacy", description: "The GPU war heats up as NVIDIA and AMD prepare to launch their next-generation graphics cards with significant performance improvements and new features.", imagePrompt: "NVIDIA vs AMD GPU side by side, futuristic tech lab background" },
  ],
  nintendo: [
    { topic: "Nintendo Switch 2 Backward Compatibility Details", description: "New details about Nintendo's next console suggest full backward compatibility with existing Switch games, along with significant hardware improvements.", imagePrompt: "Nintendo Switch 2 concept design with colorful Joy-Cons, game splash screen" },
    { topic: "Nintendo Announces Major Franchise Revival Plans", description: "Nintendo has hinted at reviving several beloved franchises for their next console generation, exciting long-time fans of the company's classic IPs.", imagePrompt: "Nintendo characters silhouetted against golden sunset, epic reveal style" },
  ],
  esports: [
    { topic: "Esports Tournament Prize Pools Reach Record Levels", description: "Esports tournament prize pools have reached unprecedented levels in 2026, with major publishers investing heavily in competitive gaming infrastructure.", imagePrompt: "Massive esports arena with crowd cheering, stage with trophy, neon lights" },
    { topic: "Valorant Champions Tour Expands to New Regions", description: "The Valorant Champions Tour is expanding to include new regions, giving more players the opportunity to compete at the highest level of tactical FPS esports.", imagePrompt: "Valorant agents in competitive pose, esports stage background, blue/orange lighting" },
  ],
}

async function findTrendingTopics(category) {
  if (genAI) {
    const prompt = `You are a gaming news editor. Find the LATEST trending news topic for the category "${category.id}" (${category.keywords}).

Return a JSON object with:
{
  "topic": "Brief topic title",
  "description": "2-3 sentence description of what's trending right now",
  "searchQuery": "search query to find articles on this topic",
  "imagePrompt": "detailed image generation prompt for a featured image (cinematic, game-related)"
}

Only return valid JSON, no markdown. Focus on news from the last 24-48 hours.`

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
      const result = await model.generateContent(prompt)
      const text = result.response.text().replace(/```json|```/g, "").trim()
      return JSON.parse(text)
    } catch (e) {
      console.log(`  Gemini topic find failed: ${e.message}`)
    }
  }

  const fallbacks = FALLBACK_TOPICS[category.id] || FALLBACK_TOPICS["gta-6"]
  const topic = fallbacks[Math.floor(Math.random() * fallbacks.length)]
  console.log(`  Using fallback topic: ${topic.topic}`)
  return {
    topic: topic.topic,
    description: topic.description,
    searchQuery: topic.topic,
    imagePrompt: topic.imagePrompt,
  }
}

function buildFallbackArticle(title, category) {
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
    title: title,
    content: paragraphs.join("\n"),
    excerpt: paragraphs[0].replace(/<[^>]+>/g, "").slice(0, 155),
    readingTime: Math.max(3, Math.ceil(paragraphs.join(" ").split(" ").length / 200)),
    imageData: null,
  }
}

async function rewriteArticle(title, sourceContent, category, imagePrompt) {
  if (!genAI) return buildFallbackArticle(title, category)

  const prompt = `You are a professional gaming journalist. Rewrite this article about "${title}" for a GTA 6 Rewards gaming platform.

CATEGORY: ${category}
SOURCE CONTENT: ${sourceContent.slice(0, 4000)}

Requirements:
- Write 800-1500 words of unique, engaging content
- Add a compelling intro paragraph
- Use gaming-community tone (exciting, informed)
- Include relevant subheadings (use <h2> tags)
- Make it SEO-friendly
- Do NOT mention "RSS", "source", or attribute to original source
- Write it as original journalism

IMAGES: Generate an image with this prompt and return it inline:
${imagePrompt}

Return JSON format:
{
  "title": "Optimized headline",
  "content": "Full HTML content with <p> and <h2> tags",
  "excerpt": "1-2 sentence summary (max 160 chars)",
  "readingTime": number,
  "imageData": "base64 encoded image data (PNG format)" or null
}

Only return valid JSON, no markdown.`
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        responseModalities: ["Text", "Image"],
      },
    })
    const result = await model.generateContent(prompt)
    const response = result.response
    let text = ""
    let imageData = null

    for (const part of response.candidates[0].content.parts) {
      if (part.text) text += part.text
      if (part.inlineData) {
        imageData = part.inlineData.data
      }
    }

    const cleaned = text.replace(/```json|```/g, "").trim()
    const parsed = JSON.parse(cleaned)
    if (imageData && !parsed.imageData) parsed.imageData = imageData
    return parsed
  } catch (e) {
    console.log(`  Gemini rewrite failed: ${e.message}, using fallback`)
    return buildFallbackArticle(title, category)
  }
}

async function scrape() {
  console.log("Starting AI-powered scraper...")
  const db = await getPrisma()
  let totalNew = 0

  for (const category of CATEGORIES) {
    console.log(`\n=== Category: ${category.id} ===`)
    const existingArticles = loadCategory(category.id)
    console.log(`  Existing articles: ${existingArticles.length}`)

    const topic = await findTrendingTopics(category)
    if (!topic) {
      console.log(`  No topic found for ${category.id}, skipping`)
      continue
    }
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
      source: "AI Generated",
      sourceUrl: "",
    }

    if (isDuplicate(article, existingArticles, null)) {
      console.log(`  Skipping (exists): ${topic.topic}`)
      continue
    }

    console.log(`  Rewriting article with AI...`)
    const rewritten = await rewriteArticle(topic.topic, topic.description, category.id, topic.imagePrompt)
    if (rewritten) {
      article.title = rewritten.title || article.title
      article.content = rewritten.content || article.content
      article.excerpt = rewritten.excerpt || article.excerpt.slice(0, 160)
      article.readingTime = rewritten.readingTime || Math.max(1, Math.ceil(article.content.split(" ").length / 200))

      if (rewritten.imageData) {
        const imgPath = join(DATA_DIR, "..", "images", "articles", `${article.slug}.png`)
        if (!existsSync(dirname(imgPath))) mkdirSync(dirname(imgPath), { recursive: true })
        writeFileSync(imgPath, Buffer.from(rewritten.imageData, "base64"))
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
