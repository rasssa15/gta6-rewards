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

const DAILY_POINTS_LIMIT = 150

export async function awardScratchCard(userId: string, reason: string, forceTier?: CardTier): Promise<ScratchResult> {
  const { prisma } = await import("@/lib/prisma")

  let earnedToday = 0
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayTotal = await prisma.pointTransaction.aggregate({
      where: {
        userId,
        amount: { gt: 0 },
        createdAt: { gte: today },
      },
      _sum: { amount: true },
    })
    earnedToday = todayTotal._sum.amount || 0
  } catch (err) {
    console.error("Daily limit check failed:", err)
  }

  if (earnedToday >= DAILY_POINTS_LIMIT) {
    const tier = forceTier || pickTier()
    const info = TIERS[tier]
    try {
      await prisma.scratchResult.create({ data: { userId, points: 0 } })
      await prisma.user.update({ where: { id: userId }, data: { scratchCardsPlayed: { increment: 1 } } })
      await prisma.pointTransaction.create({ data: { userId, amount: 0, reason: `${reason} — limit reached` } })
    } catch {}
    return { points: 0, tier, label: info.label, emoji: info.emoji }
  }

  let totalEarned = 0
  try {
    const aggregate = await prisma.scratchResult.aggregate({ where: { userId }, _sum: { points: true } })
    totalEarned = aggregate._sum.points || 0
  } catch (err) {
    console.error("Scratch aggregate failed:", err)
  }

  const tier = forceTier || pickTier()
  const info = TIERS[tier]

  const decay = totalEarned < 100
    ? 1
    : Math.max(0.008, Math.pow(1 - (totalEarned - 100) / 220, 2))

  const raw = info.min + Math.random() * (info.max - info.min)
  const points = Math.min(Math.max(1, Math.round(raw * decay)), DAILY_POINTS_LIMIT - earnedToday)

  try {
    await prisma.scratchResult.create({ data: { userId, points } })
    await prisma.user.update({ where: { id: userId }, data: { points: { increment: points }, scratchCardsPlayed: { increment: 1 } } })
    await prisma.pointTransaction.create({ data: { userId, amount: points, reason: `${reason} — ${info.emoji} ${info.label} Card` } })
  } catch {}

  return { points, tier, label: info.label, emoji: info.emoji }
}
