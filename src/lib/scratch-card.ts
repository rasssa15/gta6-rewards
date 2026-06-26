import { prisma } from "@/lib/prisma"

export type CardTier = "bronze" | "silver" | "gold"

const TIERS: Record<CardTier, { weight: number; min: number; max: number; label: string; emoji: string }> = {
  bronze: { weight: 10, min: 1, max: 2, label: "Bronze", emoji: "🥉" },
  silver: { weight: 1.5, min: 2, max: 5, label: "Silver", emoji: "🥈" },
  gold:   { weight: 0.5, min: 5, max: 10, label: "Gold", emoji: "🥇" },
}

const TOTAL_WEIGHT = Object.values(TIERS).reduce((s, t) => s + t.weight, 0)

export type ScratchResult = { points: number; tier: CardTier; label: string; emoji: string }

function pickTier(): CardTier {
  const roll = Math.random() * TOTAL_WEIGHT
  let cumulative = 0
  for (const [tier, info] of Object.entries(TIERS)) {
    cumulative += info.weight
    if (roll < cumulative) return tier as CardTier
  }
  return "bronze"
}

export async function awardScratchCard(userId: string, reason: string, forceTier?: CardTier): Promise<ScratchResult> {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return { points: 0, tier: "bronze", label: "Bronze", emoji: "🥉" }

  const aggregate = await prisma.scratchResult.aggregate({
    where: { userId },
    _sum: { points: true },
  })
  const totalEarned = aggregate._sum.points || 0

  // First 100 pts: all 3 tiers, full points. Avg ~2/card → 50+ cards for 100 pts.
  // Past 100: decay kicks in, gets harder toward 300.
  const tier = forceTier || pickTier()
  const info = TIERS[tier]

  const decay = totalEarned < 100
    ? 1
    : Math.max(0.008, Math.pow(1 - (totalEarned - 100) / 220, 2))

  const raw = info.min + Math.random() * (info.max - info.min)
  const points = Math.max(1, Math.round(raw * decay))

  await prisma.scratchResult.create({ data: { userId, points } })
  await prisma.user.update({
    where: { id: userId },
    data: {
      points: { increment: points },
      scratchCardsPlayed: { increment: 1 },
    },
  })
  await prisma.pointTransaction.create({
    data: { userId, amount: points, reason: `${reason} — ${info.emoji} ${info.label} Card` },
  })

  return { points, tier, label: info.label, emoji: info.emoji }
}
