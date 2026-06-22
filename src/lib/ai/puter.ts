/**
 * Puter.js AI Integration Module
 * 
 * This module provides AI-powered features using Puter.js.
 * Puter.js runs in the browser and requires the user to have a Puter.com session.
 * The script is loaded dynamically when needed.
 * 
 * Capabilities:
 * - AI chat for article generation and rewriting
 * - AI image generation for article thumbnails
 * - Content summarization
 * - SEO title & tag generation
 * - Translation
 */

export interface PuterAIConfig {
  model?: string
  temperature?: number
  max_tokens?: number
  stream?: boolean
  systemPrompt?: string
}

declare global {
  interface Window {
    puter?: {
      ai: {
        chat: (prompt: string, options?: PuterAIConfig) => Promise<string>
        imgGen: (prompt: string, options?: { model?: string; size?: string }) => Promise<{ url: string }[]>
        code: (prompt: string) => Promise<string>
        txt2txt: (prompt: string) => Promise<string>
        translate: (text: string, targetLang: string) => Promise<string>
      }
      print: (text: string) => void
      ui: {
        alert: (msg: string) => Promise<void>
        prompt: (msg: string, defaultValue?: string) => Promise<string | null>
      }
    }
  }
}

/**
 * Load Puter.js script dynamically
 */
export function loadPuterScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.puter) {
      resolve(true)
      return
    }

    const script = document.createElement("script")
    script.src = "https://js.puter.com/v2/"
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.head.appendChild(script)
  })
}

/**
 * Check if Puter is available
 */
export function isPuterAvailable(): boolean {
  return typeof window !== "undefined" && !!window.puter
}

/**
 * Generate article content using Puter AI
 */
export async function generateArticle(topic: string, options?: {
  style?: string
  length?: string
  tone?: string
}): Promise<{
  title: string
  content: string
  excerpt: string
  tags: string[]
  seoTitle: string
  seoDesc: string
} | null> {
  if (!isPuterAvailable()) {
    await loadPuterScript()
    if (!isPuterAvailable()) return null
  }

  const style = options?.style || "gaming news article"
  const length = options?.length || "medium"
  const tone = options?.tone || "professional yet engaging"

  const prompt = `Write a ${length} ${style} about "${topic}".
    
Write in a ${tone} tone suitable for a gaming news website.

Return the response in this exact JSON format (no markdown, no code blocks, just raw JSON):
{
  "title": "SEO-optimized article title",
  "content": "Full HTML article content with <h2>, <p>, <ul> tags. At least 5 paragraphs.",
  "excerpt": "A 2-3 sentence summary (max 160 characters)",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "seoTitle": "SEO title under 60 characters",
  "seoDesc": "Meta description under 160 characters"
}`

  try {
    const response = await window.puter!.ai.chat(prompt, {
      temperature: 0.7,
      max_tokens: 4000,
    })

    if (!response) return null

    // Try to parse JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    return null
  } catch (error) {
    console.error("Puter AI article generation failed:", error)
    return null
  }
}

/**
 * Rewrite/improve existing content
 */
export async function rewriteContent(
  content: string,
  instruction?: string
): Promise<string | null> {
  if (!isPuterAvailable()) {
    await loadPuterScript()
    if (!isPuterAvailable()) return null
  }

  const prompt = `Rewrite the following content. ${instruction || "Improve the clarity and engagement."}\n\nContent:\n${content}\n\nReturn only the rewritten content, no explanations.`

  try {
    return await window.puter!.ai.chat(prompt, {
      temperature: 0.5,
      max_tokens: 4000,
    })
  } catch (error) {
    console.error("Puter AI rewrite failed:", error)
    return null
  }
}

/**
 * Generate SEO metadata for content
 */
export async function generateSEOMetadata(
  title: string,
  content: string
): Promise<{
  seoTitle: string
  seoDesc: string
  tags: string[]
  slug: string
} | null> {
  if (!isPuterAvailable()) {
    await loadPuterScript()
    if (!isPuterAvailable()) return null
  }

  const prompt = `Generate SEO metadata for this gaming article:
    
Title: "${title}"
Content: "${content.slice(0, 1000)}..."

Return JSON only:
{
  "seoTitle": "SEO title under 60 chars",
  "seoDesc": "Meta description under 160 chars",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "slug": "url-friendly-slug"
}`

  try {
    const response = await window.puter!.ai.chat(prompt, { temperature: 0.3 })
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) return JSON.parse(jsonMatch[0])
    return null
  } catch (error) {
    console.error("Puter AI SEO failed:", error)
    return null
  }
}

/**
 * Generate article summary/excerpt
 */
export async function generateSummary(
  content: string,
  maxLength?: number
): Promise<string | null> {
  if (!isPuterAvailable()) {
    await loadPuterScript()
    if (!isPuterAvailable()) return null
  }

  const prompt = `Summarize the following article in ${maxLength || 2} sentences. 
Return ONLY the summary, no other text.

Content: ${content.slice(0, 2000)}`

  try {
    return await window.puter!.ai.chat(prompt, { temperature: 0.3, max_tokens: 200 })
  } catch (error) {
    console.error("Puter AI summary failed:", error)
    return null
  }
}

/**
 * Generate an image for an article using Puter AI
 */
export async function generateArticleImage(
  topic: string,
  style?: string
): Promise<string | null> {
  if (!isPuterAvailable()) {
    await loadPuterScript()
    if (!isPuterAvailable()) return null
  }

  const prompt = `${topic}, ${style || "video game art, cinematic quality, 4K, trending on art station"}`

  try {
    const images = await window.puter!.ai.imgGen(prompt, {
      model: "dall-e-3",
      size: "1792x1024",
    })

    if (images && images.length > 0 && images[0].url) {
      return images[0].url
    }
    return null
  } catch (error) {
    console.error("Puter AI image generation failed:", error)
    return null
  }
}

/**
 * Categorize content automatically
 */
export async function categorizeContent(
  title: string,
  content: string
): Promise<{
  category: string
  tags: string[]
  confidence: number
} | null> {
  if (!isPuterAvailable()) {
    await loadPuterScript()
    if (!isPuterAvailable()) return null
  }

  const categories = [
    "GTA 6",
    "Rockstar Games",
    "PlayStation",
    "Xbox",
    "PC Gaming",
    "Nintendo",
    "Esports",
    "Gaming Deals",
    "Reviews",
    "Guides",
  ]

  const prompt = `Categorize this gaming article into one of: ${categories.join(", ")}.
Also suggest 3-5 relevant tags.

Title: "${title}"
Content: "${content.slice(0, 500)}..."

Return JSON only:
{
  "category": "Best match from list",
  "tags": ["tag1", "tag2", "tag3"],
  "confidence": 0.95
}`

  try {
    const response = await window.puter!.ai.chat(prompt, { temperature: 0.2 })
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) return JSON.parse(jsonMatch[0])
    return null
  } catch (error) {
    console.error("Puter AI categorization failed:", error)
    return null
  }
}
