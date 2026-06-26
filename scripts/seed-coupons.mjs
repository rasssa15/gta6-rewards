import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const GAMES = [
  "The Legend of Zelda: Breath of the Wild",
  "Elden Ring",
  "Red Dead Redemption 2",
  "The Witcher 3: Wild Hunt",
  "God of War",
  "Grand Theft Auto V",
  "The Last of Us Part II",
  "Minecraft",
  "Super Mario Odyssey",
  "Dark Souls III",
  "Cyberpunk 2077",
  "Spider-Man: Miles Morales",
  "Horizon Forbidden West",
  "Final Fantasy VII Remake",
  "Resident Evil 4 Remake",
  "Baldur's Gate 3",
  "Doom Eternal",
  "Death Stranding",
  "Sekiro: Shadows Die Twice",
  "Ghost of Tsushima",
]

const SPECIAL = [
  { name: "GTA 6 Pre-Order Code", description: "Exclusive GTA 6 pre-order coupon code. Redeem for special in-game content.", cost: 250 },
]

async function main() {
  console.log("Seeding coupon rewards...\n")

  // Remove existing coupon rewards first
  await prisma.reward.deleteMany({ where: { category: "coupon" } })

  for (const name of GAMES) {
    const reward = await prisma.reward.create({
      data: {
        name: `${name} - Game Code`,
        description: `Coupon code for ${name}. Redeem your points for this digital game code.`,
        image: "",
        pointsCost: 170,
        stock: 50,
        category: "coupon",
        active: true,
      },
    })
    console.log(`  ✓ ${reward.name} — ${reward.pointsCost} pts`)
  }

  for (const item of SPECIAL) {
    const reward = await prisma.reward.create({
      data: {
        name: item.name,
        description: item.description,
        image: "",
        pointsCost: item.cost,
        stock: 100,
        category: "coupon",
        active: true,
      },
    })
    console.log(`  ★ ${reward.name} — ${reward.pointsCost} pts`)
  }

  console.log(`\n✅ ${GAMES.length + SPECIAL.length} coupon rewards seeded!`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  prisma.$disconnect()
  process.exit(1)
})
