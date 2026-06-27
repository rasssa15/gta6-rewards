import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, "..", "public", "data")
const API_BASE = process.env.API_URL || "https://gta6-rewards.vercel.app"

const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || "50")
const ADS_PER_BOT = parseInt(process.env.ADS_PER_BOT || "12")
const MAX_BOTS = parseInt(process.env.MAX_BOTS || "1000")

// Realistic user agents from different browsers
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/125.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/125.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148",
  "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/125.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Edge/125.0.0.0",
  "Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148",
]

// Traffic sources
const REFERRERS = [
  "https://www.google.com/search?q=gta+6+rewards",
  "https://www.google.com/search?q=gta+6+news+rewards",
  "https://www.bing.com/search?q=gta+6+rewards+points",
  "https://www.reddit.com/r/GTA6/",
  "https://www.reddit.com/r/GamingLeaksAndRumours/",
  "https://twitter.com/search?q=gta6%20rewards",
  "https://www.youtube.com/watch?v=QdBZY2fkU-0",
  "https://www.ign.com/articles/gta-6",
  "https://www.rockstargames.com/",
  "", // direct traffic
  "", // direct traffic
  "https://t.co/", // Twitter redirect
  "https://l.facebook.com/l.php?u=gta6-rewards.vercel.app",
  "https://www.instagram.com/",
  "https://discord.com/channels/gaming",
  "https://www.tiktok.com/@gta6clips",
  "https://news.google.com/",
]

// Accep languages
const LANGUAGES = [
  "en-US,en;q=0.9",
  "en-GB,en;q=0.8",
  "en;q=0.9",
  "en-US,en;q=0.8,es;q=0.5",
  "en-US,en;q=0.9,fr;q=0.7",
  "en-US,en;q=0.8,de;q=0.5",
  "en-US,en;q=0.9,ja;q=0.6",
  "pt-BR,pt;q=0.9,en;q=0.5",
  "ru-RU,ru;q=0.9,en;q=0.5",
]

// Hours when real users are most active
const ACTIVE_HOUR_WEIGHTS = {
  morning: { start: 7, end: 10, weight: 0.25 },
  lunch: { start: 12, end: 14, weight: 0.20 },
  afternoon: { start: 15, end: 18, weight: 0.15 },
  evening: { start: 19, end: 23, weight: 0.35 },
  night: { start: 0, end: 6, weight: 0.05 },
}

const PAGES = [
  "/", "/news", "/ads", "/earn", "/rewards", "/leaderboard",
  "/challenges", "/faq", "/redeem", "/dashboard",
]

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function weightedRandom(weights) {
  const total = weights.reduce((s, w) => s + w, 0)
  let r = Math.random() * total
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i]
    if (r <= 0) return i
  }
  return weights.length - 1
}

// Human-like delays
function humanDelay() { return rand(1500, 8000) }
function readingDelay() { return rand(5000, 30000) }
function typingDelay() { return rand(500, 2500) }
function thinkDelay() { return rand(1000, 5000) }
function sessionDuration() { return rand(120000, 600000) } // 2-10 min session

function buildHeaders() {
  return {
    "User-Agent": pick(USER_AGENTS),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": pick(LANGUAGES),
    "Accept-Encoding": "gzip, deflate, br",
    "Referer": pick(REFERRERS),
    "DNT": Math.random() > 0.5 ? "1" : "0",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": Math.random() > 0.5 ? "cross-site" : "none",
    "Sec-Fetch-User": "?1",
    "Cache-Control": Math.random() > 0.7 ? "max-age=0" : "no-cache",
  }
}

async function fetchWithRetry(url, options = {}, retries = 2) {
  const headers = { ...buildHeaders(), ...(options.headers || {}) }
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        ...options,
        headers,
        signal: AbortSignal.timeout(45000),
      })
      return res
    } catch (e) {
      if (i === retries - 1) throw e
      await sleep(rand(2000, 5000))
    }
  }
}

class Bot {
  constructor(walletId, name, botIndex) {
    this.walletId = walletId
    this.name = name
    this.botIndex = botIndex
    this.adsWatched = 0
    this.scratchCards = 0
    this.articlesRead = 0
    this.points = 0
    this.errors = 0
    this.sessionStart = Date.now()
  }

  async simulateSession() {
    // Session duration: 2-10 minutes
    const maxDuration = sessionDuration()

    const actions = [
      () => this.browseFromSearch(),
      () => this.browsePages(),
      () => this.login(),
      () => this.watchAds(),
      () => this.checkChallenges(),
      () => this.readArticles(),
      () => this.playScratchCards(),
      () => this.visitLeaderboard(),
      () => this.browseSocialShare(),
    ]

    const shuffled = [...actions].sort(() => Math.random() - 0.5)

    for (const action of shuffled) {
      if (Date.now() - this.sessionStart > maxDuration) break
      try {
        await action()
        await sleep(thinkDelay())
      } catch (e) {
        this.errors++
      }
    }

    return {
      walletId: this.walletId,
      name: this.name,
      adsWatched: this.adsWatched,
      scratchCards: this.scratchCards,
      articlesRead: this.articlesRead,
      points: this.points,
      errors: this.errors,
      sessionDuration: Math.floor((Date.now() - this.sessionStart) / 1000),
    }
  }

  // Simulate coming from Google search
  async browseFromSearch() {
    const searchTerms = [
      "gta 6 rewards", "gta 6 news", "gta 6 points",
      "earn gta 6 rewards", "gta 6 scratch cards",
      "gta 6 gaming news", "gta 6 redeem",
      "gta 6 leaderboard", "gta 6 wallet earn",
    ]
    await sleep(rand(2000, 8000)) // Time to click search result
    await fetchWithRetry(`${API_BASE}/?utm_source=google&utm_medium=organic&utm_term=${encodeURIComponent(pick(searchTerms))}`)
    await sleep(humanDelay())
  }

  // Browse 3-7 random pages like a real user
  async browsePages() {
    const pagesToVisit = rand(3, 7)
    for (let i = 0; i < pagesToVisit; i++) {
      const page = pick(PAGES)
      await fetchWithRetry(`${API_BASE}${page}`)
      await sleep(readingDelay())
    }
  }

  // Simulate sharing on social media
  async browseSocialShare() {
    if (Math.random() > 0.3) return
    await sleep(typingDelay())
    await fetchWithRetry(`${API_BASE}/news`, { headers: buildHeaders() })
    await sleep(readingDelay())
  }

  async login() {
    await fetchWithRetry(`${API_BASE}/api/users/${this.walletId}`)
    await sleep(humanDelay())
  }

  async watchAds() {
    const count = rand(10, ADS_PER_BOT)
    for (let i = 0; i < count; i++) {
      // Real human watches ad for 10-45 seconds
      await sleep(rand(10000, 45000))

      const res = await fetchWithRetry(`${API_BASE}/api/ads/watch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletId: this.walletId }),
      })

      if (res.ok) {
        const data = await res.json()
        this.adsWatched++
        this.points += data.points || 0
      } else {
        this.errors++
      }

      // Human waits between ads: 3-30 seconds (browsing other tabs)
      await sleep(rand(3000, 30000))
    }
  }

  async checkChallenges() {
    const res = await fetchWithRetry(`${API_BASE}/api/challenges?walletId=${this.walletId}`)
    if (res.ok) {
      const challenges = await res.json()
      await sleep(humanDelay())

      for (const ch of challenges) {
        if (ch.progress >= ch.target && !ch.completed) {
          await sleep(rand(3000, 8000)) // Human thinks before claiming
          try {
            await fetchWithRetry(`${API_BASE}/api/challenges/complete`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ walletId: this.walletId, challengeId: ch.id }),
            })
          } catch {}
          await sleep(humanDelay())
        }
      }
    }
  }

  async readArticles() {
    const count = rand(2, 8)
    for (let i = 0; i < count; i++) {
      const res = await fetchWithRetry(`${API_BASE}/api/articles?limit=20&offset=${rand(0, 200)}`)
      if (res.ok) {
        const data = await res.json()
        if (data.articles?.length > 0) {
          const article = pick(data.articles)
          // Time to read the article: 15-60 seconds
          await sleep(rand(15000, 60000))
          await fetchWithRetry(`${API_BASE}/api/articles/${article.id}`)
          await sleep(readingDelay())
          this.articlesRead++

          // Sometimes view an article
          if (Math.random() > 0.5) {
            await fetchWithRetry(`${API_BASE}/api/articles/${article.id}/view?walletId=${this.walletId}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ walletId: this.walletId }),
            })
          }
        }
      }
    }
  }

  async playScratchCards() {
    const count = rand(1, 8)
    for (let i = 0; i < count; i++) {
      await sleep(rand(2000, 6000))
      const res = await fetchWithRetry(`${API_BASE}/api/scratch-card`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletId: this.walletId }),
      })
      if (res.ok) {
        this.scratchCards++
        // Excitement delay after winning
        await sleep(rand(3000, 8000))
      }
    }
  }

  async visitLeaderboard() {
    await fetchWithRetry(`${API_BASE}/api/leaderboard?period=all&limit=50`)
    await sleep(humanDelay())
    if (Math.random() > 0.5) {
      await fetchWithRetry(`${API_BASE}/api/leaderboard?period=daily&limit=50`)
      await sleep(humanDelay())
    }
  }
}

async function loadAllUsers() {
  const users = []
  for (let i = 1; i <= 4; i++) {
    try {
      const data = JSON.parse(readFileSync(join(DATA_DIR, `users-${i}.json`), "utf8"))
      for (const u of data) {
        if (u.walletId) {
          users.push({ walletId: u.walletId, name: u.name })
        }
      }
    } catch (e) {
      console.error(`Failed to load users-${i}.json:`, e.message)
    }
  }
  return users
}

async function main() {
  console.log("=== GTA 6 Rewards Human Bot Simulator ===")
  console.log(`API: ${API_BASE}`)
  console.log(`Batch size: ${BATCH_SIZE}`)
  console.log(`Ads per bot: ${ADS_PER_BOT}`)
  console.log(`Max bots: ${MAX_BOTS}`)

  const allUsers = await loadAllUsers()
  console.log(`Loaded ${allUsers.length} user wallet IDs`)

  const targetBots = Math.min(MAX_BOTS, allUsers.length)
  const selectedUsers = allUsers.slice(0, targetBots)

  console.log(`Will simulate ${selectedUsers.length} bots across ${Math.ceil(selectedUsers.length / BATCH_SIZE)} batches\n`)

  let totalAds = 0
  let totalScratch = 0
  let totalArticles = 0
  let totalPoints = 0
  let totalErrors = 0
  let completedBots = 0
  let totalSessionTime = 0

  const startTime = Date.now()

  for (let batch = 0; batch < selectedUsers.length; batch += BATCH_SIZE) {
    const batchUsers = selectedUsers.slice(batch, batch + BATCH_SIZE)
    const batchNum = Math.floor(batch / BATCH_SIZE) + 1
    const totalBatches = Math.ceil(selectedUsers.length / BATCH_SIZE)

    console.log(`\n--- Batch ${batchNum}/${totalBatches} (${batchUsers.length} bots) ---`)

    const concurrency = Math.min(30, batchUsers.length)
    for (let i = 0; i < batchUsers.length; i += concurrency) {
      const chunk = batchUsers.slice(i, i + concurrency)

      const results = await Promise.allSettled(
        chunk.map((u, idx) => {
          const bot = new Bot(u.walletId, u.name, batch + i + idx)
          return bot.simulateSession()
        })
      )

      for (const result of results) {
        if (result.status === "fulfilled") {
          const r = result.value
          totalAds += r.adsWatched
          totalScratch += r.scratchCards
          totalArticles += r.articlesRead
          totalPoints += r.points
          totalErrors += r.errors
          totalSessionTime += r.sessionDuration
          completedBots++
        } else {
          totalErrors++
        }
      }

      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      console.log(`  ${completedBots}/${selectedUsers.length} done | avg ${completedBots > 0 ? Math.round(totalSessionTime / completedBots) : 0}s/bot | ${elapsed}s elapsed`)

      await sleep(rand(3000, 8000))
    }

    if (batch + BATCH_SIZE < selectedUsers.length) {
      const batchDelay = rand(15000, 45000)
      console.log(`  Waiting ${Math.floor(batchDelay / 1000)}s before next batch...`)
      await sleep(batchDelay)
    }
  }

  const totalTime = Math.floor((Date.now() - startTime) / 1000)
  const minutes = Math.floor(totalTime / 60)
  const seconds = totalTime % 60

  console.log("\n" + "=".repeat(50))
  console.log("SIMULATION COMPLETE")
  console.log("=".repeat(50))
  console.log(`Duration: ${minutes}m ${seconds}s`)
  console.log(`Bots simulated: ${completedBots}`)
  console.log(`Total ads watched: ${totalAds}`)
  console.log(`Total scratch cards: ${totalScratch}`)
  console.log(`Total articles read: ${totalArticles}`)
  console.log(`Total points earned: ${totalPoints}`)
  console.log(`Total errors: ${totalErrors}`)
  console.log(`\nAverages:`)
  console.log(`  Ads/bot: ${completedBots > 0 ? (totalAds / completedBots).toFixed(1) : 0}`)
  console.log(`  Points/bot: ${completedBots > 0 ? Math.round(totalPoints / completedBots) : 0}`)
  console.log(`  Session/bot: ${completedBots > 0 ? Math.round(totalSessionTime / completedBots) : 0}s`)
  console.log(`  Error rate: ${completedBots > 0 ? (totalErrors / completedBots).toFixed(2) : 0}/bot`)
  console.log(`  Ads/minute: ${totalTime > 0 ? (totalAds / (totalTime / 60)).toFixed(1) : 0}`)
}

main().catch(console.error)
