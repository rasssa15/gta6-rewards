import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

async function main() {
  const r = await prisma.reward.updateMany({
    where: { name: "GTA 6 - Pre-Order Code" },
    data: { pointsCost: 1000 },
  })
  console.log("GTA 6 Pre-Order updated:", r.count)

  const d = await prisma.reward.deleteMany({
    where: { name: "GTA 6 - Exclusive Theme Pack" },
  })
  console.log("Old theme pack deleted:", d.count)

  const dup = await prisma.reward.deleteMany({
    where: { name: { contains: "★ GTA 6 Pre-Order" } },
  })
  console.log("Duplicate pre-order deleted:", dup.count)

  const all = await prisma.reward.findMany({
    where: { OR: [{ name: { contains: "Pre-Order" } }, { category: "theme-pack" }] },
    select: { name: true, pointsCost: true, category: true },
  })
  all.forEach((r) => console.log(`  ${r.name}: ${r.pointsCost} pts [${r.category}]`))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect().catch(() => {}))
