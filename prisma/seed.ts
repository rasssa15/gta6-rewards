import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const categories = [
    { name: "GTA 6", slug: "gta-6" },
    { name: "Rockstar", slug: "rockstar" },
    { name: "PlayStation", slug: "playstation" },
    { name: "Xbox", slug: "xbox" },
    { name: "PC Gaming", slug: "pc-gaming" },
    { name: "Nintendo", slug: "nintendo" },
    { name: "Esports", slug: "esports" },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
  }

  const achievements = [
    { key: "first_login", name: "First Steps", description: "Log in for the first time", icon: "log-in", xpReward: 10, pointReward: 5 },
    { key: "first_scratch", name: "Lucky Start", description: "Play your first scratch card", icon: "sparkles", xpReward: 20, pointReward: 10 },
    { key: "read_10", name: "Bookworm", description: "Read 10 articles", icon: "book-open", xpReward: 50, pointReward: 25 },
    { key: "read_100", name: "Scholar", description: "Read 100 articles", icon: "graduation-cap", xpReward: 200, pointReward: 100 },
    { key: "watch_50", name: "Ad Master", description: "Watch 50 ads", icon: "tv", xpReward: 100, pointReward: 50 },
    { key: "points_1000", name: "Point Collector", description: "Earn 1,000 points", icon: "trophy", xpReward: 300, pointReward: 150 },
    { key: "refer_5", name: "Social Butterfly", description: "Refer 5 friends", icon: "users", xpReward: 100, pointReward: 50 },
  ]

  for (const ach of achievements) {
    await prisma.achievement.upsert({
      where: { key: ach.key },
      update: {},
      create: ach,
    })
  }

  const dailyChallenges = [
    { key: "read_3_articles", title: "Read 3 Articles", description: "Read three articles today", xpReward: 30, pointReward: 15, type: "read_articles", target: 3 },
    { key: "earn_20_points", title: "Earn 20 Points", description: "Earn 20 points through any activity", xpReward: 40, pointReward: 20, type: "earn_points", target: 20 },
    { key: "visit_daily", title: "Daily Visitor", description: "Just visit the site today", xpReward: 10, pointReward: 5, type: "daily_visit", target: 1 },
  ]

  for (const ch of dailyChallenges) {
    await prisma.challenge.upsert({
      where: { key: ch.key },
      update: {},
      create: ch,
    })
  }

  const rewards = [
    { name: "Steam $5 Gift Card", description: "Steam digital gift card", pointsCost: 500, stock: 10, category: "gift-card" },
    { name: "Steam $10 Gift Card", description: "Steam digital gift card", pointsCost: 900, stock: 5, category: "gift-card" },
    { name: "Xbox Game Pass 1 Month", description: "Xbox Game Pass Ultimate", pointsCost: 800, stock: 5, category: "gift-card" },
    { name: "GTA 6 Wallpaper Pack", description: "Exclusive GTA 6 wallpapers", pointsCost: 50, stock: 100, category: "digital" },
    { name: "GTA 6 Theme Pack", description: "Custom GTA 6 theme for your dashboard", pointsCost: 100, stock: 50, category: "digital" },
  ]

  for (const r of rewards) {
    await prisma.reward.upsert({
      where: { id: r.name },
      update: {},
      create: { id: r.name, ...r },
    })
  }

  console.log("Database seeded successfully")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
