export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const isGet = request.method === "GET"

    let prompt
    let width = 1200
    let height = 675

    if (isGet) {
      prompt = url.searchParams.get("prompt")
      width = parseInt(url.searchParams.get("width") || "1200")
      height = parseInt(url.searchParams.get("height") || "675")
      if (!prompt) {
        return new Response("Missing 'prompt' query param", { status: 400 })
      }
    } else if (request.method === "POST") {
      let body
      try {
        body = await request.json()
      } catch {
        return new Response("Invalid JSON", { status: 400 })
      }
      prompt = body.prompt
      width = body.width || 1200
      height = body.height || 675
      if (!prompt) {
        return new Response("Missing 'prompt' field", { status: 400 })
      }
    } else {
      return new Response("Send GET with ?prompt= or POST with JSON body", { status: 405 })
    }

    const inputs = { prompt, width, height }

    try {
      const result = await env.AI.run(
        "@cf/stabilityai/stable-diffusion-xl-base-1.0",
        inputs
      )

      const imageData = result?.image || result

      return new Response(imageData, {
        headers: {
          "content-type": "image/png",
          "cache-control": "public, max-age=31536000",
        },
      })
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { "content-type": "application/json" },
      })
    }
  },
}
