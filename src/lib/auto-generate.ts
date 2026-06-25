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

const SAMPLE_HEADLINES: Record<string, string[]> = {
  "gta-6": [
    "GTA 6 Leak Reveals New Gameplay Mechanics in Vice City",
    "Rockstar Confirms GTA 6 Map Size Details",
    "GTA 6 Storyline Rumors: Multiple Protagonists Confirmed",
    "GTA 6 Release Window Narrowed to Holiday 2025",
    "GTA 6 Tech Demo Shows Ray Tracing Breakthroughs",
  ],
  rockstar: [
    "Rockstar Games Announces Major Update for GTA Online",
    "Rockstar Addresses GTA 6 Development Timeline",
    "Rockstar's Next-Gen RAGE Engine Details Revealed",
    "Rockstar Hiring for Unannounced Open World Project",
    "GTA Online Summer Update Brings New Heists",
  ],
  playstation: [
    "PlayStation 5 Pro Specs and Release Date Rumors Surface",
    "Sony Secures Major Third-Party Exclusives for 2025",
    "PlayStation Plus Game Catalog Expands with Major Titles",
    "PS5 System Update Adds Long-Requested Features",
    "Sony Reports Record PlayStation Revenue This Quarter",
  ],
  xbox: [
    "Xbox Game Pass Adds Major Third-Party Titles This Month",
    "Microsoft Teases Next-Gen Xbox Hardware Plans",
    "Xbox Cloud Gaming Expanding to Smart TVs Globally",
    "Xbox Series X Sales Surge Following Price Drop",
    "Microsoft's Studio Acquisitions Begin to Bear Fruit",
  ],
  "pc-gaming": [
    "PC Gaming Hardware Sales Surge Globally",
    "NVIDIA and AMD Battle for GPU Supremacy",
    "Steam Breaks Concurrent Player Record Again",
    "PC Gaming Handheld Market Sees Explosive Growth",
    "DirectX 13 Announced with Major Performance Gains",
  ],
  nintendo: [
    "Nintendo Switch 2 Backward Compatibility Details Emerge",
    "Nintendo Announces Major Franchise Revival Plans",
    "Switch Successor Specs Leak Ahead of Official Reveal",
    "Nintendo's Indie Showcase Highlights Upcoming Gems",
    "Zelda and Mario Franchises Continue to Dominate Sales",
  ],
  esports: [
    "Esports Tournament Prize Pools Reach Record Levels",
    "Valorant Champions Tour Expands to New Regions",
    "League of Legends World Championship Viewership Hits Record",
    "Esports Franchise Model Under Scrutiny by Regulators",
    "Mobile Esports Emerges as Fastest Growing Segment",
  ],
}

function getRandomHeadline(category: string): string {
  const pool = SAMPLE_HEADLINES[category] || SAMPLE_HEADLINES["gta-6"]
  return pick(pool)
}

export async function getNewsHeadline(category: string): Promise<string> {
  if (!genAI) return getRandomHeadline(category)

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
    const prompt = `You are a gaming news editor. Give me ONE breaking news headline about ${category} in the context of GTA 6, Rockstar Games, and gaming. The headline must be factual-sounding, under 100 characters, and feel like real gaming journalism. Output ONLY the headline, nothing else. Include the current date context (late June 2026).`
    const result = await model.generateContent(prompt)
    return result.response.text().trim().slice(0, 120)
  } catch {
    return getRandomHeadline(category)
  }
}

export async function writeArticle(headline: string, category: string): Promise<{
  title: string
  content: string
  excerpt: string
  readingTime: number
  tags: string
}> {
  const defaultContent = buildFallbackArticle(headline)

  if (!genAI) {
    return {
      title: headline,
      content: defaultContent,
      excerpt: headline.slice(0, 155),
      readingTime: 4,
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
      excerpt: headline.slice(0, 155),
      readingTime: 4,
      tags: category.replace(/-/g, ","),
    }
  }
}

function buildFallbackArticle(headline: string): string {
  const paragraphs = [
    `<p>The gaming community is buzzing with excitement following the latest developments surrounding ${headline.toLowerCase()}. This breaking news has captured the attention of players worldwide, with discussions already heating up across social media platforms, gaming forums, and community channels dedicated to tracking every detail of this evolving story.</p>`,
    `<p>Industry analysts have been quick to weigh in on the significance of this development, noting that it arrives at a pivotal moment for the gaming industry. The current landscape is characterized by rapid technological advancement, shifting player expectations, and intense competition among major publishers and platform holders, making any major announcement particularly consequential.</p>`,
    `<p>Sources close to the situation have indicated that this development represents a significant milestone that could have far-reaching implications for how players experience their favorite franchises in the coming months and years. The details that have emerged thus far paint a picture of ambitious planning and execution by the teams involved.</p>`,
    `<p>The response from the community has been overwhelmingly positive, with fans expressing enthusiasm about what this means for the future of their favorite gaming experiences. Many have taken to social media to share their reactions, theories, and hopes for what comes next, creating a groundswell of engagement that developers are sure to be monitoring closely.</p>`,
    `<p>As with any major gaming news story, it is important to note that some details may still be subject to change as official announcements and confirmations emerge. The gaming industry moves quickly, and the information landscape can shift rapidly as new details come to light through official channels and verified sources.</p>`,
    `<p>For those who want to stay up to date with this developing story, following official social media channels, trusted gaming news outlets, and community discussion hubs is the best way to ensure you do not miss any important updates. The GTA 6 Rewards team will continue to monitor this story and provide comprehensive coverage as new information becomes available to the public.</p>`,
    `<p>This announcement serves as yet another reminder of the dynamic and ever-evolving nature of the interactive entertainment industry, where innovation, creativity, and player engagement continue to drive the medium forward. The coming weeks and months promise to bring even more exciting developments that will shape the future of gaming for years to come.</p>`,
  ]
  return paragraphs.join("\n")
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
