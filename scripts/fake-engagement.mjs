import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const FAKE_NAMES = [
  "GTA_Fan2026", "ViceCityPlayer", "MiamiGrinder", "RockstarFanboy",
  "GTA6_Hype", "JasonFan2025", "LuciaMain", "ViceCityOG",
  "GTA_Veteran", "LootGoblin99", "ScratchKing", "PointsHunter",
  "MiamiVice420", "GTA_Whale", "CashGrinder", "RewardSeeker",
  "Level100Player", "TopReferrer", "DailyGrinder", "AdWatcher_Pro",
  "FreeRewardGuy", "GTA_Leaks", "GameNewsDaily", "ViceCityNews",
  "GTA6_Tracker", "MiamiLeaks", "GTA_Rumors", "RewardFarmer",
  "PointsCollector", "GTA6_Update", "ViceCity_Fan", "RockstarLeaks",
  "GTA6_Newbie", "MiamiGrinder2", "TopPlayer_2026", "GTA_VIP",
  "FreePoints123", "RewardChaser", "GTA6_Beta", "ViceCityKing",
]

const COMMENT_TEMPLATES = [
  "This is awesome! Can't wait for GTA 6",
  "Just earned points from this article!",
  "Love this site, the rewards are legit",
  "Does anyone know when the next update is?",
  "I've been grinding all day, worth it",
  "The scratch cards are so addictive",
  "Just redeemed my first reward!",
  "GTA 6 is going to be insane",
  "Vice City looks amazing in the trailers",
  "Anyone else from Miami here?",
  "Rockstar never disappoints",
  "I check this site every day for new articles",
  "The leaderboard is competitive this month",
  "Just hit level 10! The grind is real",
  "Love the new article format",
  "Jason and Lucia are going to be great protagonists",
  "This is better than the other reward sites",
  "Just earned my PS5 gift card!",
  "The ads are worth watching for the points",
  "Started playing last week, already level 5",
  "Who else is saving up for the Xbox reward?",
  "GTA 6 launch day is going to be epic",
  "Vice City nightlife is going to be legendary",
  "Just read all the new articles, great content",
  "The referral bonus is amazing",
  "I've told all my friends about this site",
  "Can't believe how many rewards they have",
  "Just won 500 points from a scratch card!",
  "The daily challenges keep me coming back",
  "Anyone else grinding for the top spot?",
  "GTA 6 news is the best news",
  "Love the new UI update",
  "Just shared this with my gaming group",
  "The points add up faster than you think",
  "Best gaming reward site period",
  "Just got my friend to sign up",
  "The article content is really informative",
  "Keep up the great work Rockstar!",
  "This site is a goldmine for GTA fans",
  "Just hit 10,000 points!",
]

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function fakeTimestamp(hoursAgo) {
  const now = Date.now()
  // Realistic traffic pattern: more activity in evening, less at night
  let hour
  const roll = Math.random()
  if (roll < 0.4) hour = rand(18, 23) * Math.random() // evening peak
  else if (roll < 0.7) hour = rand(10, 17) * Math.random() // daytime
  else if (roll < 0.9) hour = rand(7, 9) * Math.random() // morning
  else hour = rand(0, 6) * Math.random() // night (low)
  
  const spread = hoursAgo * 3600000
  const offset = (hour / 24) * spread + Math.random() * 3600000
  return new Date(now - offset)
}

async function main() {
  console.log("=== GTA 6 Rewards — Fake Engagement (Optimized) ===\n")

  // Get top 50 most recent articles only (what users actually see)
  const articles = await prisma.article.findMany({
    select: { id: true, slug: true, title: true, viewCount: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  })
  console.log(`Processing ${articles.length} most recent articles\n`)

  // Create 40 fake users for comments
  const fakeUsers = []
  for (let i = 0; i < 40; i++) {
    const walletId = `fake_${Date.now()}_${rand(10000, 99999)}_${i}`
    const user = await prisma.user.create({
      data: {
        walletId,
        name: pick(FAKE_NAMES),
        points: rand(500, 8000),
        level: rand(2, 15),
        referralCode: `REF${rand(100000, 999999)}`,
      },
    })
    fakeUsers.push(user)
  }
  console.log(`Created ${fakeUsers.length} fake users\n`)

  // --- FAKE COMMENTS (batch insert) ---
  console.log("--- Adding Fake Comments (20-35 per article) ---")
  const allCommentData = []
  for (const article of articles) {
    const count = rand(20, 35)
    const shuffledUsers = [...fakeUsers].sort(() => Math.random() - 0.5).slice(0, count)
    
    for (const user of shuffledUsers) {
      allCommentData.push({
        content: pick(COMMENT_TEMPLATES),
        articleId: article.id,
        userId: user.id,
        likes: rand(0, 12),
        createdAt: fakeTimestamp(24),
      })
    }
  }

  // Batch insert comments (500 at a time)
  const BATCH = 500
  for (let i = 0; i < allCommentData.length; i += BATCH) {
    const batch = allCommentData.slice(i, i + BATCH)
    await prisma.comment.createMany({ data: batch })
    process.stdout.write(`  Comments: ${Math.min(i + BATCH, allCommentData.length)}/${allCommentData.length}\r`)
  }
  console.log(`\n  Total comments: ${allCommentData.length}\n`)

  // --- FAKE VIEWS (batch insert) ---
  console.log("--- Adding Fake Views (gradual over 24h) ---")
  let totalViews = 0
  for (const article of articles) {
    // Target: 800-2500 views per article
    const targetViews = rand(800, 2500)
    const needed = Math.max(0, targetViews - article.viewCount)
    if (needed <= 0) continue

    const viewData = []
    for (let v = 0; v < needed; v++) {
      viewData.push({
        articleId: article.id,
        userId: pick(fakeUsers).id,
        createdAt: fakeTimestamp(24),
      })
    }

    // Batch insert views
    for (let i = 0; i < viewData.length; i += BATCH) {
      const batch = viewData.slice(i, i + BATCH)
      await prisma.articleView.createMany({ data: batch })
    }

    // Update viewCount
    await prisma.article.update({
      where: { id: article.id },
      data: { viewCount: article.viewCount + needed },
    })

    totalViews += needed
    process.stdout.write(`  Views: ${totalViews}\r`)
  }
  console.log(`\n  Total views added: ${totalViews}\n`)

  // --- SUMMARY ---
  const finalComments = await prisma.comment.count()
  const finalViews = await prisma.articleView.count()
  console.log("=== SUMMARY ===")
  console.log(`Total comments in DB: ${finalComments}`)
  console.log(`Total view records in DB: ${finalViews}`)
  console.log("Done!")

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  prisma.$disconnect()
  process.exit(1)
})
