import { readFileSync, writeFileSync } from "fs"

const DATA_DIR = "public/data"

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

// Load all articles with their createdAt
console.log("Loading articles...")
const CATEGORIES = ["gta-6", "rockstar", "playstation", "xbox", "pc-gaming", "nintendo", "esports"]
const articleDates = new Map()
for (const cat of CATEGORIES) {
  const articles = JSON.parse(readFileSync(`${DATA_DIR}/articles-${cat}.json`, "utf8"))
  for (const a of articles) {
    articleDates.set(a.id, new Date(a.createdAt))
  }
}
console.log(`  ${articleDates.size} articles loaded`)

// Fix each comment chunk
for (let chunk = 1; chunk <= 4; chunk++) {
  const path = `${DATA_DIR}/comments-${chunk}.json`
  const comments = JSON.parse(readFileSync(path, "utf8"))
  let fixed = 0

  for (const c of comments) {
    const articleDate = articleDates.get(c.articleId)
    if (articleDate) {
      const commentDate = new Date(c.createdAt)
      if (commentDate < articleDate) {
        const earliest = new Date(Math.max(articleDate.getTime(), new Date("2025-01-01").getTime()))
        c.createdAt = randomDate(earliest, new Date("2026-06-24")).toISOString()
        fixed++
      }
    }
  }

  writeFileSync(path, JSON.stringify(comments))
  const size = (Buffer.byteLength(JSON.stringify(comments)) / 1024 / 1024).toFixed(1)
  console.log(`  ${path}: ${fixed} comments fixed, ${size} MB`)
}

console.log("\n✅ Comment dates fixed!")
