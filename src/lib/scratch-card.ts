import { prisma } from "@/lib/prisma"

const ADS_THRESHOLD = 100
const CARD_CAP_NORMAL = 80
const CARD_CAP_OVERADS = 10
const ABSOLUTE_MAX = 150

export type ScratchResult = { points: number; capped: boolean }

export async function awardScratchCard(userId: string, reason: string): Promise<ScratchResult> {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return { points: 0, capped: true }

  const aggregate = await prisma.scratchResult.aggregate({
    where: { userId },
    _sum: { points: true },
  })
  const totalEarned = aggregate._sum.points || 0

  if (totalEarned >= ABSOLUTE_MAX) return { points: 0, capped: true }

  const cap = user.adsWatched > ADS_THRESHOLD ? CARD_CAP_OVERADS : CARD_CAP_NORMAL
  const remaining = Math.max(0, cap - totalEarned)
  if (remaining <= 0) return { points: 0, capped: true }

  let points: number
  const played = user.scratchCardsPlayed

  if (played < 20) {
    const base = Math.max(0.3, 3 - (played + 1) * 0.14)
    const variance = Math.random() * 1.5 - 0.75
    points = Math.max(1, Math.round(base + variance))
  } else {
    points = Math.random() < 0.5 ? 1 : 2
  }

  points = Math.min(points, remaining)

  await prisma.scratchResult.create({ data: { userId, points } })
  await prisma.user.update({
    where: { id: userId },
    data: {
      points: { increment: points },
      scratchCardsPlayed: { increment: 1 },
    },
  })
  await prisma.pointTransaction.create({
    data: { userId, amount: points, reason },
  })

  return { points, capped: false }
}
