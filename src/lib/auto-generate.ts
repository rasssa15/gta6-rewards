import slugify from "slugify"
import { createHash } from "crypto"
import { generateImageWithOpenAI } from "./openai-image"
import { buildImagePrompt } from "./worker-image"

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
  return getRandomHeadline(category)
}

export async function writeArticle(headline: string, category: string): Promise<{
  title: string
  content: string
  excerpt: string
  readingTime: number
  tags: string
}> {
  return {
    title: headline,
    content: buildFallbackArticle(headline),
    excerpt: headline.slice(0, 155),
    readingTime: 4,
    tags: category.replace(/-/g, ","),
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

export async function generateArticleImage(title: string, category: string): Promise<string> {
  const prompt = buildImagePrompt(title, category)
  const openAiUrl = await generateImageWithOpenAI(prompt)
  if (openAiUrl) return openAiUrl
  const workerUrl = process.env.WORKER_IMAGE_GEN_URL
  if (workerUrl) {
    const params = new URLSearchParams({ prompt, width: "1200", height: "675" })
    return `${workerUrl}?${params.toString()}`
  }
  const seed = hashSeed(title)
  return `https://picsum.photos/seed/${seed}/1200/675`
}

export function generateSlug(title: string): string {
  const base = slugify(title, { lower: true, strict: true })
  const suffix = Date.now().toString(36).slice(-6)
  return `${base}-${suffix}`
}
