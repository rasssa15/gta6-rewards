const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 12)
  const userPassword = await bcrypt.hash("user123", 12)

  const admin = await prisma.user.upsert({
    where: { email: "admin@gta6rewards.com" },
    update: {},
    create: {
      email: "admin@gta6rewards.com",
      name: "Admin",
      username: "admin",
      password: adminPassword,
      role: "admin",
      points: 10000,
      xp: 5000,
      level: 50,
      rank: "Legend",
      referralCode: "ADMIN2024",
    },
  })

  const user = await prisma.user.upsert({
    where: { email: "player@gta6rewards.com" },
    update: {},
    create: {
      email: "player@gta6rewards.com",
      name: "Player One",
      username: "player1",
      password: userPassword,
      role: "user",
      points: 500,
      xp: 250,
      level: 5,
      rank: "Silver",
      referralCode: "PLAYER1",
    },
  })

  await prisma.achievement.deleteMany()
  await prisma.article.deleteMany()
  await prisma.pointTransaction.deleteMany()

  const achievements = [
    { name: "First Login", description: "Log in for the first time", icon: "LogIn", category: "general", points: 15, xp: 50, condition: "first_login", threshold: 1 },
    { name: "First Reward", description: "Redeem your first reward", icon: "Gift", category: "rewards", points: 15, xp: 50, condition: "first_reward", threshold: 1 },
    { name: "First Scratch", description: "Open your first scratch card", icon: "Sparkles", category: "scratch", points: 15, xp: 50, condition: "scratch_cards", threshold: 1 },
    { name: "Reader", description: "Read 10 articles", icon: "BookOpen", category: "reading", points: 15, xp: 100, condition: "articles_read", threshold: 10 },
    { name: "Bookworm", description: "Read 50 articles", icon: "BookOpen", category: "reading", points: 30, xp: 250, condition: "articles_read", threshold: 50 },
    { name: "Ad Watcher", description: "Watch 25 ads", icon: "Play", category: "ads", points: 15, xp: 100, condition: "ads_watched", threshold: 25 },
    { name: "Ad Addict", description: "Watch 100 ads", icon: "Play", category: "ads", points: 30, xp: 250, condition: "ads_watched", threshold: 100 },
    { name: "Referrer", description: "Refer your first friend", icon: "Users", category: "referral", points: 15, xp: 100, condition: "referrals", threshold: 1 },
    { name: "Influencer", description: "Refer 10 friends", icon: "Users", category: "referral", points: 50, xp: 500, condition: "referrals", threshold: 10 },
    { name: "Point Collector", description: "Reach 100 points", icon: "Coins", category: "points", points: 15, xp: 50, condition: "total_points", threshold: 100 },
    { name: "Point Hoarder", description: "Reach 500 points", icon: "Coins", category: "points", points: 30, xp: 250, condition: "total_points", threshold: 500 },
    { name: "Point Millionaire", description: "Reach 1000 points", icon: "Coins", category: "points", points: 50, xp: 500, condition: "total_points", threshold: 1000 },
    { name: "Streak Master", description: "Maintain a 7-day login streak", icon: "Flame", category: "streak", points: 25, xp: 200, condition: "streak", threshold: 7 },
    { name: "Challenge Accepted", description: "Complete your first challenge", icon: "Trophy", category: "challenges", points: 15, xp: 50, condition: "challenges_completed", threshold: 1 },
    { name: "Challenge Champion", description: "Complete 25 challenges", icon: "Trophy", category: "challenges", points: 50, xp: 500, condition: "challenges_completed", threshold: 25 },
  ]

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { name: achievement.name },
      update: {},
      create: achievement,
    })
  }

  const rewards = [
    { name: "$5 Steam Gift Card", description: "Steam wallet credit", type: "steam", value: 5, cost: 500, stock: 100 },
    { name: "$10 Steam Gift Card", description: "Steam wallet credit", type: "steam", value: 10, cost: 1000, stock: 50 },
    { name: "$25 Steam Gift Card", description: "Steam wallet credit", type: "steam", value: 25, cost: 2500, stock: 25 },
    { name: "$10 PlayStation Gift Card", description: "PlayStation Store credit", type: "playstation", value: 10, cost: 1000, stock: 50 },
    { name: "$25 PlayStation Gift Card", description: "PlayStation Store credit", type: "playstation", value: 25, cost: 2500, stock: 25 },
    { name: "$10 Xbox Gift Card", description: "Xbox Store credit", type: "xbox", value: 10, cost: 1000, stock: 50 },
    { name: "$25 Xbox Gift Card", description: "Xbox Store credit", type: "xbox", value: 25, cost: 2500, stock: 25 },
    { name: "Premium Membership (1 Month)", description: "Unlock exclusive features", type: "premium", value: 1, cost: 500, stock: 1000 },
    { name: "Premium Membership (3 Months)", description: "Unlock exclusive features", type: "premium", value: 3, cost: 1200, stock: 500 },
    { name: "GTA 6 Wallpaper Pack", description: "Exclusive GTA 6 wallpapers", type: "digital", value: 1, cost: 100, stock: 9999 },
    { name: "Neon Avatar Pack", description: "Premium neon avatars", type: "digital", value: 1, cost: 150, stock: 9999 },
    { name: "Custom Discord Role", description: "Exclusive role on our Discord", type: "custom", value: 1, cost: 200, stock: 100 },
  ]

  await prisma.reward.deleteMany()
  for (const reward of rewards) {
    await prisma.reward.create({ data: reward })
  }

  const articles = [
    {
      title: "GTA 6: Everything We Know About Vice City's Return",
      slug: "gta-6-everything-we-know",
      excerpt: "Rockstar Games has finally pulled back the curtain on Grand Theft Auto VI. Here's everything we know about the highly anticipated return to Vice City.",
      content: "<p>Grand Theft Auto VI is finally on the horizon, and the gaming world is buzzing with excitement. After years of speculation, leaks, and rumors, Rockstar Games has officially confirmed that the next installment in the legendary franchise will take us back to the neon-soaked streets of Vice City.</p><h2>Setting and Story</h2><p>Set in the modern-day Vice City, GTA 6 promises to deliver the most immersive open-world experience yet. The game will feature a dual-protagonist system, drawing inspiration from the beloved Bonnie and Clyde dynamic. Players will navigate through a sprawling metropolis filled with activities, missions, and secrets.</p><h2>Graphics and Performance</h2><p>Built on Rockstar's RAGE engine, GTA 6 pushes the boundaries of what's possible in gaming. Early footage showcases stunning ray tracing, dynamic weather systems, and incredibly detailed character models that bring Vice City to life like never before.</p><h2>Release Date</h2><p>While Rockstar has remained tight-lipped about an exact release date, industry insiders suggest a late 2025 launch for current-gen consoles, with a PC release following in 2026.</p>",
      category: "GTA 6",
      tags: "gta6,rockstar,gaming,vicecity",
      status: "published",
      featured: true,
      readTime: "5 min read",
      imageUrl: "https://images.unsplash.com/photo-1615807713086-bfc4975801d0?w=1200",
    },
    {
      title: "Rockstar Games Confirms Next-Gen RAGE Engine Details",
      slug: "rockstar-rage-engine-next-gen",
      excerpt: "Rockstar reveals technical details about the next evolution of their proprietary RAGE engine powering GTA 6 and future titles.",
      content: "<p>Rockstar Games has released detailed technical specifications for the next iteration of their RAGE engine, the powerhouse behind GTA 6. The engine update brings revolutionary improvements to physics, rendering, and AI systems.</p>",
      category: "Rockstar Games",
      tags: "rockstar,rage,engine,technology",
      status: "published",
      featured: true,
      readTime: "4 min read",
      imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200",
    },
    {
      title: "PlayStation 5 Pro: Enhanced GTA 6 Performance Revealed",
      slug: "ps5-pro-gta-6-performance",
      excerpt: "Sony's mid-generation upgrade promises to deliver GTA 6 at 60fps with full ray tracing. Here's what players can expect.",
      content: "<p>The upcoming PlayStation 5 Pro is shaping up to be the definitive way to experience GTA 6. With enhanced GPU capabilities and advanced ray tracing hardware, Sony's mid-gen refresh targets silky-smooth 60fps gameplay in Rockstar's open-world masterpiece.</p>",
      category: "PlayStation",
      tags: "playstation,ps5,gta6,performance",
      status: "published",
      featured: false,
      readTime: "3 min read",
      imageUrl: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=1200",
    },
    {
      title: "Xbox Series X Gets GTA 6 Bundle Announcement",
      slug: "xbox-gta-6-bundle",
      excerpt: "Microsoft partners with Rockstar for exclusive GTA 6 Xbox Series X bundles featuring custom console designs.",
      content: "<p>Microsoft has announced a partnership with Rockstar Games to release limited edition GTA 6 Xbox Series X consoles. The custom-designed bundles will feature Vice City-inspired artwork and include exclusive in-game content.</p>",
      category: "Xbox",
      tags: "xbox,microsoft,gta6,bundle",
      status: "published",
      featured: false,
      readTime: "3 min read",
      imageUrl: "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=1200",
    },
    {
      title: "PC Gaming: GTA 6 System Requirements Leaked?",
      slug: "gta-6-pc-requirements",
      excerpt: "Alleged system requirements for the PC version of GTA 6 have surfaced online. Is your rig ready for Vice City?",
      content: "<p>Potential system requirements for Grand Theft Auto VI on PC have appeared on various forums, giving PC gamers an idea of what they'll need to run Rockstar's next masterpiece. The requirements suggest a well-optimized port that still pushes high-end hardware.</p>",
      category: "PC Gaming",
      tags: "pc,gaming,requirements,gta6",
      status: "published",
      featured: false,
      readTime: "4 min read",
      imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200",
    },
    {
      title: "Nintendo Switch 2 Could Run GTA 6 According to Rumors",
      slug: "nintendo-switch-2-gta-6",
      excerpt: "Next-gen Nintendo hardware might be powerful enough to run a port of GTA 6, according to industry insiders.",
      content: "<p>Rumors surrounding Nintendo's next console suggest that it may have enough power to run a scaled-down version of GTA 6. This would be a massive get for Nintendo, bringing Rockstar's magnum opus to a Nintendo platform for the first time since GTA: Chinatown Wars.</p>",
      category: "Nintendo",
      tags: "nintendo,switch,gta6,rumors",
      status: "published",
      featured: false,
      readTime: "3 min read",
      imageUrl: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=1200",
    },
    {
      title: "GTA 6 Online: What We Know About the Next Generation of GTA Online",
      slug: "gta-6-online-details",
      excerpt: "Rockstar is building the next generation of GTA Online from the ground up. Here's what we know about the future of online heists.",
      content: "<p>GTA Online has been a phenomenon, and Rockstar is taking everything they've learned to build GTA 6 Online. The new online mode promises more heists, activities, and a persistent world that evolves over time.</p>",
      category: "GTA 6",
      tags: "gta6,online,gtaonline,heists",
      status: "published",
      featured: true,
      readTime: "5 min read",
      imageUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1200",
    },
    {
      title: "Esports: GTA 6 Could Revolutionize Competitive Gaming",
      slug: "gta-6-esports-potential",
      excerpt: "Could GTA 6 become the next big esport? Industry experts weigh in on the competitive potential of Rockstar's upcoming title.",
      content: "<p>The esports world is watching GTA 6 closely. With Rockstar's track record of creating engaging multiplayer experiences, there's potential for competitive modes that could rival existing esports titles.</p>",
      category: "Esports",
      tags: "esports,competitive,gta6,gaming",
      status: "published",
      featured: false,
      readTime: "4 min read",
      imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200",
    },
  ]

  for (const article of articles) {
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {},
      create: {
        ...article,
        authorId: admin.id,
        publishedAt: new Date(),
      },
    })
  }

  const challenges = [
    { name: "Daily Reader", description: "Read 5 articles today", type: "daily", requirement: 5, points: 10, xp: 25, icon: "BookOpen", category: "reading" },
    { name: "Ad Watcher", description: "Watch 3 ads today", type: "daily", requirement: 3, points: 10, xp: 25, icon: "Play", category: "ads" },
    { name: "Social Sharer", description: "Share 2 articles today", type: "daily", requirement: 2, points: 10, xp: 25, icon: "Share2", category: "social" },
    { name: "Scratch Master", description: "Open 1 scratch card", type: "daily", requirement: 1, points: 10, xp: 25, icon: "Sparkles", category: "scratch" },
    { name: "Visitor", description: "Visit the website today", type: "daily", requirement: 1, points: 5, xp: 10, icon: "Globe", category: "general" },
  ]

  await prisma.challenge.deleteMany()
  for (const challenge of challenges) {
    await prisma.challenge.create({ data: challenge })
  }

  await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: {},
    create: {
      id: "main",
      data: JSON.stringify({
        siteName: "GTA 6 Rewards",
        siteDescription: "Earn rewards while staying up to date with the latest GTA 6 and gaming news",
        scratchProbabilities: { 1: 30, 2: 25, 3: 20, 5: 12, 10: 8, 25: 4, 50: 1 },
        adPointsReward: 2,
        dailyLoginPoints: 5,
        referralPoints: 50,
        articleReadPoints: 1,
        articleSharePoints: 2,
      }),
    },
  })

  console.log("Seed completed successfully!")
  console.log("Admin: admin@gta6rewards.com / admin123")
  console.log("User: player@gta6rewards.com / user123")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
