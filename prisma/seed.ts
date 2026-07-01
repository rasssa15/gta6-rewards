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

  const adChallenges = [
    { key: "watch_10", title: "Watch 10 Ads", description: "Watch 10 ads to earn rewards", xpReward: 20, pointReward: 10, type: "watch_ads", target: 10 },
    { key: "watch_25", title: "Watch 25 Ads", description: "Watch 25 ads to earn rewards", xpReward: 30, pointReward: 15, type: "watch_ads", target: 25 },
    { key: "watch_50", title: "Watch 50 Ads", description: "Watch 50 ads to earn rewards", xpReward: 50, pointReward: 25, type: "watch_ads", target: 50 },
    { key: "watch_100", title: "Watch 100 Ads", description: "Watch 100 ads to earn rewards", xpReward: 80, pointReward: 50, type: "watch_ads", target: 100 },
  ]

  for (const ch of adChallenges) {
    await prisma.challenge.upsert({
      where: { key: ch.key },
      update: {},
      create: ch,
    })
  }

  const rewards = [
    { name: "GTA 6 - Pre-Order Code", description: "Secure your copy of GTA 6 on any platform. Be first in Vice City.", pointsCost: 1000, stock: 50, category: "coupon-gta6" },
    { name: "Steam - $5 Game Coupon", description: "Redeem for any Steam game of your choice.", pointsCost: 170, stock: 30, category: "coupon-steam" },
    { name: "Steam - $10 Game Coupon", description: "Get $10 off your next Steam purchase.", pointsCost: 300, stock: 20, category: "coupon-steam" },
    { name: "Epic Games - $5 Coupon", description: "Save on Epic Games Store purchases.", pointsCost: 170, stock: 25, category: "coupon-epic" },
    { name: "PlayStation - $5 Store Credit", description: "Add funds to your PlayStation Network wallet.", pointsCost: 200, stock: 20, category: "coupon-playstation" },
    { name: "Xbox - $5 Gift Code", description: "Redeem on Xbox Marketplace for games and add-ons.", pointsCost: 200, stock: 20, category: "coupon-xbox" },
    { name: "Nintendo eShop - $5 Code", description: "Add credit to your Nintendo eShop account.", pointsCost: 200, stock: 15, category: "coupon-nintendo" },
    { name: "Steam - Mystery Game Key", description: "Random Steam game key — could be anything from indie gems to AAA titles!", pointsCost: 120, stock: 40, category: "coupon-steam" },
    { name: "100 GTA Wallpaper Pack", description: "100 exclusive GTA-themed HD wallpapers — Vice City sunsets, neon skylines, sports cars, and more. Instant digital download.", pointsCost: 30, stock: 999, category: "wallpaper-pack" },
    { name: "GTA VI - Neon Theme Pack", description: "Unlock the exclusive GTA Vice City neon theme. Transforms your entire dashboard with vibrant neon pink, blue, and purple gradients.", pointsCost: 50, stock: 50, category: "theme-pack" },
  ]

  for (const r of rewards) {
    await prisma.reward.upsert({
      where: { id: r.name },
      update: {},
      create: { id: r.name, ...r },
    })
  }

  // Set reward images based on category
  const allRewards = await prisma.reward.findMany({ where: { active: true } })
  for (const r of allRewards) {
    const cat = r.category
    if (cat === "wallpaper-pack") {
      const imagePath = "/images/rewards/wallpaper-pack.svg"
    } else if (cat === "theme-pack") {
      const imagePath = "/images/rewards/theme-pack.svg"
      if (!r.image || r.image === "") {
        await prisma.reward.update({ where: { id: r.id }, data: { image: imagePath } })
      }
    } else {
      const plat = cat.replace("coupon-", "")
      const imagePath = `/images/rewards/${plat}-coupon.svg`
      if (!r.image || r.image === "") {
        await prisma.reward.update({ where: { id: r.id }, data: { image: imagePath } })
      }
    }
  }

  console.log("Database seeded successfully with rewards and images")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
