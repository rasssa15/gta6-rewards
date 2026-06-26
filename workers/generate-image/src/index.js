export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("Send POST with JSON body: { prompt, width?, height? }", { status: 405 })
    }

    let body
    try {
      body = await request.json()
    } catch {
      return new Response("Invalid JSON", { status: 400 })
    }

    if (!body.prompt) {
      return new Response("Missing 'prompt' field", { status: 400 })
    }

    const inputs = {
      prompt: body.prompt,
      width: body.width || 1200,
      height: body.height || 675,
    }

    try {
      const result = await env.AI.run(
        "@cf/stabilityai/stable-diffusion-xl-base-1.0",
        inputs
      )

      const imageData = result
        ? result.image || result
        : result

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
