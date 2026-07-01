import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const IMG_MAP = {
  "coupon-steam": "/images/rewards/steam-coupon.svg",
  "coupon-epic": "/images/rewards/epic-coupon.svg",
  "coupon-playstation": "/images/rewards/playstation-coupon.svg",
  "coupon-xbox": "/images/rewards/xbox-coupon.svg",
  "coupon-nintendo": "/images/rewards/nintendo-coupon.svg",
  "coupon-bronze": "/images/rewards/bronze-tier.svg",
  "coupon-silver": "/images/rewards/silver-tier.svg",
  "coupon-gold": "/images/rewards/gold-tier.svg",
  "coupon-gta6": "/images/rewards/gta6-preorder.svg",
  "coupon-giftcard": "/images/rewards/giftcard.svg",
}

async function main() {
  const rewards = await prisma.reward.findMany({ where: { active: true } })
  let updated = 0

  for (const reward of rewards) {
    const newImg = IMG_MAP[reward.category]
    if (newImg && reward.image !== newImg) {
      await prisma.reward.update({
        where: { id: reward.id },
        data: { image: newImg },
      })
      console.log(`  ✓ ${reward.name} → ${newImg}`)
      updated++
    }
  }

  console.log(`\n✅ Updated ${updated} rewards with local images`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  prisma.$disconnect()
  process.exit(1)
})
