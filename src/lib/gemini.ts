import { GoogleGenerativeAI } from "@google/generative-ai"

const API_KEY = process.env.GEMINI_API_KEY || ""

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null

export async function rewriteArticle(title: string, content: string, source: string) {
  if (!genAI) {
    return { title, content, seoTitle: title, seoDesc: content.slice(0, 160), tags: source }
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    const prompt = `You are a gaming news editor for GTA 6 Rewards. Rewrite this article for a gaming audience.
Keep all key facts and dates. Make it engaging for GTA fans. Use a conversational but professional tone.

Original title: ${title}
Original source: ${source}
Original content:
${content.slice(0, 4000)}

Return JSON:
{
  "title": "rewritten title (catchy, SEO-friendly, under 80 chars)",
  "content": "full rewritten article in clean HTML paragraphs",
  "seoTitle": "SEO title under 60 chars",
  "seoDesc": "meta description under 160 chars",
  "tags": "comma-separated tags",
  "readingTime": number (estimated minutes)
}`

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim()

    try {
      return JSON.parse(cleaned)
    } catch {
      return { title, content, seoTitle: title, seoDesc: content.slice(0, 160), tags: source }
    }
  } catch (error) {
    console.error("Gemini rewrite failed:", error)
    return { title, content, seoTitle: title, seoDesc: content.slice(0, 160), tags: source }
  }
}

export async function generateImagePrompt(title: string, content: string) {
  if (!genAI) return "GTA 6 gaming news article banner"

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
    const prompt = `Create a detailed image generation prompt for a gaming news article banner image.
Article title: ${title}
Keep it under 200 characters. Focus on GTA/gaming themes.`

    const result = await model.generateContent(prompt)
    return result.response.text().trim().slice(0, 200)
  } catch {
    return "GTA 6 gaming news article banner"
  }
}
