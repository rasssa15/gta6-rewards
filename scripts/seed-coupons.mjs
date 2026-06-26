import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const PLATFORMS = {
  steam: { label: "Steam", cost: 170, games: [
    "Elden Ring", "The Witcher 3: Wild Hunt", "Dark Souls III",
    "Cyberpunk 2077", "Baldur's Gate 3", "Doom Eternal",
    "Sekiro: Shadows Die Twice", "Death Stranding",
  ]},
  epic: { label: "Epic Games", cost: 170, games: [
    "Red Dead Redemption 2", "Grand Theft Auto V", "Horizon Forbidden West",
  ]},
  playstation: { label: "PlayStation", cost: 170, games: [
    "God of War", "The Last of Us Part II", "Spider-Man: Miles Morales",
    "Ghost of Tsushima", "Final Fantasy VII Remake", "Resident Evil 4 Remake",
  ]},
  xbox: { label: "Xbox", cost: 170, games: [
    "Minecraft", "Forza Horizon 5", "Halo Infinite",
  ]},
  nintendo: { label: "Nintendo", cost: 170, games: [
    "The Legend of Zelda: Breath of the Wild", "Super Mario Odyssey",
  ]},
}

const TIERS = [
  { name: "🥉 Bronze Steam Coupon", description: "Entry-level Steam coupon code. Small discount, big start. Grab yours before they're gone!", cost: 70, stock: 50, image: "https://picsum.photos/seed/bronze/400/300", cat: "coupon-bronze" },
  { name: "🥈 Silver Steam Coupon", description: "Mid-tier Steam coupon code. For the real gamers. Unlock bigger savings today!", cost: 160, stock: 50, image: "https://picsum.photos/seed/silver/400/300", cat: "coupon-silver" },
  { name: "🥇 Gold Steam Coupon", description: "Premium Steam coupon code. The ultimate reward for the ultimate player. Maximum savings!", cost: 200, stock: 50, image: "https://picsum.photos/seed/gold/400/300", cat: "coupon-gold" },
]

const GIFTCARDS = [
  { name: "Steam Gift Card - ₹100", description: "100 Rupees Steam wallet code. Currently sold out — check back soon!", cost: 70, stock: 0, cat: "coupon-giftcard" },
  { name: "Steam Gift Card - ₹200", description: "200 Rupees Steam wallet code. Currently sold out — check back soon!", cost: 160, stock: 0, cat: "coupon-giftcard" },
  { name: "Steam Gift Card - ₹250", description: "250 Rupees Steam wallet code. Currently sold out — check back soon!", cost: 200, stock: 0, cat: "coupon-giftcard" },
]

const SPECIAL = [
  { name: "★ GTA 6 Pre-Order Code", description: "Exclusive GTA 6 pre-order coupon code for any platform. Be the first in Vice City!", cost: 250, stock: 100, image: "https://picsum.photos/seed/gta6-vice/400/300", cat: "coupon-gta6" },
]

async function main() {
  console.log("Seeding coupon rewards by platform...\n")

  // Remove existing coupon rewards
  await prisma.reward.deleteMany({ where: { category: { startsWith: "coupon" } } })

  for (const [plat, info] of Object.entries(PLATFORMS)) {
    console.log(`\n${info.label}:`)
    for (const game of info.games) {
      const reward = await prisma.reward.create({
        data: {
          name: `${info.label} - ${game}`,
          description: `Coupon code for ${game} on ${info.label}. Redeem your points for this digital game code.`,
          image: `https://picsum.photos/seed/${plat}-${game.replace(/[^a-z0-9]/gi, "")}/400/300`,
          pointsCost: info.cost,
          stock: 50,
          category: `coupon-${plat}`,
          active: true,
        },
      })
      console.log(`  ✓ ${reward.name} — ${reward.pointsCost} pts`)
    }
  }

  console.log(`\nCoupon Tiers:`)
  for (const item of TIERS) {
    const reward = await prisma.reward.create({
      data: {
        name: item.name,
        description: item.description,
        image: item.image,
        pointsCost: item.cost,
        stock: item.stock,
        category: item.cat,
        active: true,
      },
    })
    console.log(`  ★ ${reward.name} — ${reward.pointsCost} pts (stock: ${reward.stock})`)
  }

  console.log(`\nGift Cards (Sold Out):`)
  for (const item of GIFTCARDS) {
    const reward = await prisma.reward.create({
      data: {
        name: item.name,
        description: item.description,
        image: `https://picsum.photos/seed/giftcard-${item.cost}/400/300`,
        pointsCost: item.cost,
        stock: item.stock,
        category: item.cat,
        active: true,
      },
    })
    console.log(`  ✗ ${reward.name} — ${reward.pointsCost} pts (sold out)`)
  }

  console.log(`\n${SPECIAL[0].name}:`)
  for (const item of SPECIAL) {
    const reward = await prisma.reward.create({
      data: {
        name: item.name,
        description: item.description,
        image: item.image,
        pointsCost: item.cost,
        stock: item.stock,
        category: item.cat,
        active: true,
      },
    })
    console.log(`  ★ ${reward.name} — ${reward.pointsCost} pts`)
  }

  console.log(`\n✅ Done!`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  prisma.$disconnect()
  process.exit(1)
})
