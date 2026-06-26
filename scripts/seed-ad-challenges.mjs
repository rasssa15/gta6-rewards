import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const CHALLENGES = [
  { key: "ad_5",  title: "🥇 Ad Starter",     description: "Watch 5 ads to earn a guaranteed Gold Scratch Card!", target: 5,  reward: "gold" },
  { key: "ad_10", title: "🥇 Ad Hunter",       description: "Watch 10 ads and claim another Gold Scratch Card!", target: 10, reward: "gold" },
  { key: "ad_15", title: "🥇 Ad Grinder",      description: "Watch 15 ads — another Gold Card waiting for you!", target: 15, reward: "gold" },
  { key: "ad_20", title: "🎁 Ad Collector",    description: "Watch 20 ads and unlock a Mystery Chest with 5 random cards!", target: 20, reward: "chest" },
  { key: "ad_25", title: "🥇 Ad Warrior",      description: "Watch 25 ads and score a Gold Scratch Card!", target: 25, reward: "gold" },
  { key: "ad_30", title: "🥇 Ad Master",       description: "Watch 30 ads — you earned another Gold Card!", target: 30, reward: "gold" },
  { key: "ad_40", title: "🎁 Ad Legend",       description: "Watch 40 ads and open a Mystery Chest with 5 random cards!", target: 40, reward: "chest" },
  { key: "ad_50", title: "🥇 Ad Hero",         description: "Watch 50 ads — claim your Gold Scratch Card, champion!", target: 50, reward: "gold" },
  { key: "ad_75", title: "🎁 Ad Champion",     description: "Watch 75 ads and unlock a massive Mystery Chest with 5 random cards!", target: 75, reward: "chest" },
  { key: "ad_100",title: "🎁 Ad GOD",          description: "Watch 100 ads — the ultimate Mystery Chest with 5 random cards is yours!", target: 100, reward: "chest" },
]

async function main() {
  console.log("Seeding ad milestone challenges...\n")

  // Remove existing ad challenges
  await prisma.challenge.deleteMany({ where: { key: { startsWith: "ad_" } } })

  for (const ch of CHALLENGES) {
    const challenge = await prisma.challenge.create({
      data: {
        key: ch.key,
        title: ch.title,
        description: ch.description,
        target: ch.target,
        type: "watch_ads",
        pointReward: 0,
        xpReward: 50,
        active: true,
      },
    })
    console.log(`  ✓ ${challenge.title} — ${challenge.target} ads (${ch.reward})`)
  }

  console.log(`\n✅ Done! ${CHALLENGES.length} challenges seeded.`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  prisma.$disconnect()
  process.exit(1)
})
