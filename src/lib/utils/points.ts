import { prisma } from "../prisma"
import { checkAchievements } from "../auth/auth"

export async function awardPoints(
  userId: string,
  points: number,
  source: string,
  note?: string,
  reference?: string
) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      points: { increment: points },
      totalPointsEarned: { increment: points },
    },
  })

  await prisma.pointTransaction.create({
    data: {
      userId,
      points,
      type: "earned",
      source,
      reference,
      note,
    },
  })

  await checkAchievements(userId)
}

export async function deductPoints(userId: string, points: number, note?: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { points: { decrement: points } },
  })

  await prisma.pointTransaction.create({
    data: {
      userId,
      points: -points,
      type: "spent",
      source: "redemption",
      note,
    },
  })
}

export async function getPointBalance(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { points: true },
  })
  return user?.points ?? 0
}
