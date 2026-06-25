import { GoogleGenerativeAI } from "@google/generative-ai"
import slugify from "slugify"
import { createHash } from "crypto"

const API_KEY = process.env.GEMINI_API_KEY || ""
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null

const CATEGORY_MAP: Record<string, { id: string; name: string }> = {
  "gta-6": { id: "gta-6", name: "GTA 6" },
  rockstar: { id: "rockstar", name: "Rockstar" },
  playstation: { id: "playstation", name: "PlayStation" },
  xbox: { id: "xbox", name: "Xbox" },
  "pc-gaming": { id: "pc-gaming", name: "PC Gaming" },
  nintendo: { id: "nintendo", name: "Nintendo" },
  esports: { id: "esports", name: "Esports" },
}

const CATEGORY_SLUGS = Object.keys(CATEGORY_MAP)

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function hashSeed(text: string): string {
  return createHash("md5").update(text).digest("hex").slice(0, 16)
}

function removeJsonMarkers(text: string): string {
  return text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim()
}

export function getCategoryList() {
  return CATEGORY_SLUGS
}

export function getRandomCategory(): string {
  return pick(CATEGORY_SLUGS)
}

export async function getNewsHeadline(category: string): Promise<string> {
  if (!genAI) {
    const sample = [
      "GTA 6 Leak Reveals New Gameplay Mechanics in Vice City",
      "Rockstar Games Announces Major Update for GTA Online",
      "PlayStation 5 Pro Specs and Release Date Rumors Surface",
      "Xbox Game Pass Adds Major Third-Party Titles This Month",
      "PC Gaming Hardware Sales Surge Globally",
      "Nintendo Switch 2 Backward Compatibility Details Emerge",
      "Esports Tournament Prize Pools Reach Record Levels",
    ]
    return pick(sample)
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
  const prompt = `You are a gaming news editor. Give me ONE breaking news headline about ${category} in the context of GTA 6, Rockstar Games, and gaming. The headline must be factual-sounding, under 100 characters, and feel like real gaming journalism. Output ONLY the headline, nothing else. Include the current date context (late June 2026).`
  const result = await model.generateContent(prompt)
  return result.response.text().trim().slice(0, 120)
}

export async function writeArticle(headline: string, category: string): Promise<{
  title: string
  content: string
  excerpt: string
  readingTime: number
  tags: string
}> {
  const defaultContent = `<p>New details have emerged about ${headline.toLowerCase()}, generating excitement across the gaming community. Players are eagerly awaiting official confirmation and additional information from developers. This development represents another significant milestone in the ongoing evolution of interactive entertainment.</p><p>Industry analysts have noted that this news aligns with broader trends in the gaming market, where innovation and player engagement continue to drive the industry forward. The response from the community has been overwhelmingly positive, with discussions taking place across social media platforms and gaming forums.</p><p>As more information becomes available, we will continue to provide updates and analysis. Stay tuned to GTA 6 Rewards for the latest coverage on this developing story.</p>`

  if (!genAI) {
    return {
      title: headline,
      content: defaultContent,
      excerpt: headline,
      readingTime: 3,
      tags: category.replace(/-/g, ","),
    }
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
  const prompt = `You are a professional gaming journalist writing for GTA 6 Rewards. Write a detailed, creative, and interesting article about this headline:

"${headline}"

The article must:
- Be written in clean HTML paragraph format (use <p> tags)
- Be at least 600 words of engaging content
- Include specific details, analysis, and context
- Reference the current date (late June 2026)
- Sound like real gaming journalism
- End with a concluding paragraph

Return JSON (no markdown):
{
  "title": "catchy article title under 80 chars",
  "content": "full article in HTML <p> paragraphs",
  "excerpt": "one sentence summary under 160 chars",
  "readingTime": number (estimated minutes),
  "tags": "comma-separated,relevant,tags"
}`

  try {
    const result = await model.generateContent(prompt)
    const text = removeJsonMarkers(result.response.text())
    return JSON.parse(text)
  } catch {
    return {
      title: headline,
      content: defaultContent,
      excerpt: headline,
      readingTime: 3,
      tags: category.replace(/-/g, ","),
    }
  }
}

export function generateArticleImage(title: string, category: string): string {
  const seed = hashSeed(title)
  const catId = CATEGORY_SLUGS.indexOf(category)
  const seedNum = (parseInt(seed.slice(0, 8), 16) % 100) + 1 + catId * 20
  return `https://picsum.photos/seed/${seed}/1200/675`
}

export function generateSlug(title: string): string {
  const base = slugify(title, { lower: true, strict: true })
  const suffix = Date.now().toString(36).slice(-6)
  return `${base}-${suffix}`
}
