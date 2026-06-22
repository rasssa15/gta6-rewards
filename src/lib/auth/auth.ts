import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { compare } from "bcryptjs"
import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import DiscordProvider from "next-auth/providers/discord"
import { prisma } from "../prisma"
import { generateReferralCode } from "../utils/codes"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
    newUser: "/auth/register",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) return null

        const isValid = await compare(credentials.password, user.password)
        if (!isValid) return null

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        })

        await handleDailyLogin(user.id)

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        }
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
    ...(process.env.DISCORD_CLIENT_ID
      ? [
          DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID!,
            clientSecret: process.env.DISCORD_CLIENT_SECRET!,
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id
        ;(session.user as any).role = token.role
      }
      return session
    },
  },
}

async function handleDailyLogin(userId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const existing = await prisma.dailyLogin.findUnique({
    where: { userId_date: { userId, date: today } },
  })

  if (!existing) {
    await prisma.dailyLogin.create({
      data: { userId, date: today, pointsAwarded: 5 },
    })

    await prisma.user.update({
      where: { id: userId },
      data: {
        points: { increment: 5 },
        totalPointsEarned: { increment: 5 },
        streak: { increment: 1 },
      },
    })

    await prisma.pointTransaction.create({
      data: {
        userId,
        points: 5,
        type: "earned",
        source: "daily_login",
        note: "Daily login reward",
      },
    })

    await checkAchievements(userId)
  }
}

export async function checkAchievements(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      achievements: true,
      referrals: { where: { status: "completed" } },
      challengeCompletions: true,
    },
  })

  if (!user) return

  const allAchievements = await prisma.achievement.findMany()
  const userAchievementNames = user.achievements.map((ua) => ua.achievementId)

  for (const achievement of allAchievements) {
    if (userAchievementNames.includes(achievement.id)) continue

    let earned = false

    switch (achievement.condition) {
      case "first_login":
        earned = user.lastLoginAt !== null
        break
      case "articles_read":
        earned = user.articlesRead >= achievement.threshold
        break
      case "ads_watched":
        earned = user.adsWatched >= achievement.threshold
        break
      case "referrals":
        earned = user.referrals.length >= achievement.threshold
        break
      case "total_points":
        earned = user.totalPointsEarned >= achievement.threshold
        break
      case "streak":
        earned = user.streak >= achievement.threshold
        break
      case "challenges_completed":
        earned = user.challengeCompletions.length >= achievement.threshold
        break
      case "scratch_cards":
        earned = user.scratchCardsOpened >= achievement.threshold
        break
      case "first_reward":
        const redemptions = await prisma.redemption.count({ where: { userId } })
        earned = redemptions >= achievement.threshold
        break
    }

    if (earned) {
      await prisma.userAchievement.create({
        data: { userId, achievementId: achievement.id },
      })

      await prisma.user.update({
        where: { id: userId },
        data: {
          points: { increment: achievement.points },
          totalPointsEarned: { increment: achievement.points },
          xp: { increment: achievement.xp },
        },
      })

      await prisma.pointTransaction.create({
        data: {
          userId,
          points: achievement.points,
          type: "earned",
          source: "achievement",
          reference: achievement.id,
          note: `Achievement: ${achievement.name}`,
        },
      })

      await prisma.notification.create({
        data: {
          userId,
          title: "Achievement Unlocked!",
          message: `You earned "${achievement.name}" - ${achievement.description}`,
          type: "achievement",
          link: "/achievements",
        },
      })
    }
  }

  await updateUserLevel(userId)
}

export async function updateUserLevel(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return

  let level = 1
  let xpNeeded = 100
  let totalXp = user.xp

  while (totalXp >= xpNeeded) {
    totalXp -= xpNeeded
    level++
    xpNeeded = Math.floor(xpNeeded * 1.5)
  }

  let rank = "Bronze"
  if (level >= 40) rank = "Legend"
  else if (level >= 30) rank = "Diamond"
  else if (level >= 20) rank = "Platinum"
  else if (level >= 15) rank = "Gold"
  else if (level >= 8) rank = "Silver"

  if (level !== user.level || rank !== user.rank) {
    await prisma.user.update({
      where: { id: userId },
      data: { level, rank },
    })
  }
}
