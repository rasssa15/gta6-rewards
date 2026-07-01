const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ""

type OpenAIImageResult = {
  url: string
  revised_prompt?: string
}

export async function generateImageWithOpenAI(
  prompt: string,
  size = "1200x675",
  quality: "low" | "medium" | "high" = "medium"
): Promise<string | null> {
  if (!OPENAI_API_KEY) return null

  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-image-2",
        prompt,
        n: 1,
        size,
        quality,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error("OpenAI gpt-image-2 error:", err)
      return null
    }

    const data = await response.json()
    return data.data?.[0]?.url || null
  } catch (error) {
    console.error("OpenAI image generation failed:", error)
    return null
  }
}
