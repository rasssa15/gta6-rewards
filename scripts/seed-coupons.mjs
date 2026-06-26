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

const SPECIAL = [
  { name: "GTA 6 Pre-Order Code", description: "Exclusive GTA 6 pre-order coupon code for any platform.", cost: 250, cat: "coupon-gta6" },
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
          image: "",
          pointsCost: info.cost,
          stock: 50,
          category: `coupon-${plat}`,
          active: true,
        },
      })
      console.log(`  ✓ ${reward.name} — ${reward.pointsCost} pts`)
    }
  }

  console.log(`\n${SPECIAL[0].name}:`)
  for (const item of SPECIAL) {
    const reward = await prisma.reward.create({
      data: {
        name: item.name,
        description: item.description,
        image: "",
        pointsCost: item.cost,
        stock: 100,
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
