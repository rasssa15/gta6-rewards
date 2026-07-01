const WORKER_URL = process.env.WORKER_IMAGE_GEN_URL || ""

export function getWorkerImageUrl(prompt: string, width = 1200, height = 675): string {
  if (!WORKER_URL) return ""
  const params = new URLSearchParams({ prompt, width: String(width), height: String(height) })
  return `${WORKER_URL}?${params.toString()}`
}

export function buildImagePrompt(title: string, category: string): string {
  const topic = (category || "gaming").replace(/-/g, " ")
  return `High-quality game art, ${topic} theme: ${title}. Detailed environment, vibrant colors, professional lighting, digital art, no text, no watermark`
}
