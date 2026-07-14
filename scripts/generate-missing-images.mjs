import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CF_TOKEN = process.env.CF_API_TOKEN
const CF_ACCOUNT = process.env.CF_ACCOUNT_ID

if (!CF_TOKEN || !CF_ACCOUNT) {
  console.error("Missing CF_API_TOKEN or CF_ACCOUNT_ID in env")
  process.exit(1)
}

const categories = ["gta-6", "rockstar", "playstation", "xbox", "pc-gaming", "nintendo", "esports"]

function makePrompt(title, category) {
  return `video game screenshot, ${title.substring(0, 60)}, gaming graphics, ${category}, 16:9 landscape, high quality, detailed`
}

async function generateImage(prompt, slug) {
  const filePath = `public/images/articles/${slug}.png`
  if (fs.existsSync(filePath)) {
    console.log(`  Already exists: ${slug}.png`)
    return `/images/articles/${slug}.png`
  }
  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/ai/run/@cf/black-forest-labs/flux-1-schnell`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      }
    )
    if (!res.ok) {
      console.log(`  API error ${res.status}`)
      return null
    }
    const ct = res.headers.get("content-type") || ""
    let buf
    if (ct.includes("image/")) {
      buf = Buffer.from(await res.arrayBuffer())
    } else {
      const data = await res.json()
      if (data.success && data.result?.image) {
        buf = Buffer.from(data.result.image, "base64")
      } else if (data.success && data.result?.data?.[0]) {
        buf = Buffer.from(data.result.data[0], "base64")
      } else {
        console.log(`  Unexpected response`)
        return null
      }
    }
    fs.mkdirSync("public/images/articles", { recursive: true })
    fs.writeFileSync(filePath, buf)
    console.log(`  Saved: ${slug}.png (${buf.length} bytes)`)
    return `/images/articles/${slug}.png`
  } catch (e) {
    console.log(`  Error: ${e.message}`)
    return null
  }
}

async function main() {
  const articles = []
  for (const cat of categories) {
    const fp = `public/data/articles-${cat}.json`
    if (!fs.existsSync(fp)) continue
    const list = JSON.parse(fs.readFileSync(fp, "utf8"))
    for (const a of list) {
      if (!a.featuredImage || a.featuredImage === "" || a.featuredImage === "null" || a.featuredImage.startsWith("https://picsum")) {
        if (!fs.existsSync(`public/images/articles/${a.slug}.png`)) {
          articles.push(a)
        }
      }
    }
  }
  console.log(`Found ${articles.length} articles missing images`)
  let updated = 0
  for (let i = 0; i < articles.length; i++) {
    const a = articles[i]
    const cat = categories.find(c => a.slug.includes(c) || a.slug.endsWith(c) || categories.some(c2 => a.category?.name?.toLowerCase() === c2))
      || a.slug.split("-").slice(0, 2).join("-")
    const prompt = makePrompt(a.title, cat || "gaming")
    console.log(`[${i + 1}/${articles.length}] ${a.title.substring(0, 50)}...`)
    const imgPath = await generateImage(prompt, a.slug)
    if (imgPath) {
      a.featuredImage = imgPath
      updated++
    }
  }
  for (const cat of categories) {
    const fp = `public/data/articles-${cat}.json`
    if (!fs.existsSync(fp)) continue
    fs.writeFileSync(fp, JSON.stringify(JSON.parse(fs.readFileSync(fp, "utf8")), null, 2))
  }
  console.log(`\nDone. Generated ${updated} images.`)
}

main().catch(console.error)
