import { prisma } from "../prisma"
import { awardPoints } from "./points"

export async function generateScratchCardReward(): Promise<number> {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "main" } })
  const probabilities = settings
    ? JSON.parse(settings.data).scratchProbabilities
    : { 1: 30, 2: 25, 3: 20, 5: 12, 10: 8, 25: 4, 50: 1 }

  const entries = Object.entries(probabilities).map(([reward, prob]) => ({
    reward: parseInt(reward),
    probability: prob as number,
  }))

  const totalProb = entries.reduce((sum, e) => sum + e.probability, 0)
  let random = Math.random() * totalProb

  for (const entry of entries) {
    random -= entry.probability
    if (random <= 0) return entry.reward
  }

  return 1
}

export async function openScratchCard(userId: string, cardId: string) {
  const card = await prisma.scratchCard.findUnique({
    where: { id: cardId },
  })

  if (!card || card.userId !== userId || card.status !== "unused") {
    throw new Error("Invalid scratch card")
  }

  const reward = card.reward

  await prisma.scratchCard.update({
    where: { id: cardId },
    data: { status: "used", usedAt: new Date() },
  })

  await prisma.user.update({
    where: { id: userId },
    data: { scratchCardsOpened: { increment: 1 } },
  })

  await awardPoints(userId, reward, "scratch_card", `Scratch card reward: ${reward} points`, cardId)

  return { reward, cardId }
}
