import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const old = await prisma.challenge.findMany({ where: { type: { not: "watch_ads" } } })
  console.log(`Found ${old.length} old daily challenges:\n`)
  for (const c of old) {
    console.log(`  ${c.key} — ${c.title}`)
  }

  const del = await prisma.challenge.deleteMany({ where: { type: { not: "watch_ads" } } })
  console.log(`\nDeleted ${del.count} old challenges.`)

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  prisma.$disconnect()
  process.exit(1)
})
