import { Prisma } from "@prisma/client"

export type User = Prisma.UserGetPayload<{}>
export type Article = Prisma.ArticleGetPayload<{}>
export type Comment = Prisma.CommentGetPayload<{}>
export type Reward = Prisma.RewardGetPayload<{}>
export type Redemption = Prisma.RedemptionGetPayload<{}>
export type ScratchCard = Prisma.ScratchCardGetPayload<{}>
export type Referral = Prisma.ReferralGetPayload<{}>
export type Achievement = Prisma.AchievementGetPayload<{}>
export type UserAchievement = Prisma.UserAchievementGetPayload<{}>
export type PointTransaction = Prisma.PointTransactionGetPayload<{}>
export type DailyLogin = Prisma.DailyLoginGetPayload<{}>
export type Challenge = Prisma.ChallengeGetPayload<{}>
export type ChallengeCompletion = Prisma.ChallengeCompletionGetPayload<{}>
export type Notification = Prisma.NotificationGetPayload<{}>
export type AdCampaign = Prisma.AdCampaignGetPayload<{}>
export type AdWatch = Prisma.AdWatchGetPayload<{}>
export type ArticleBookmark = Prisma.ArticleBookmarkGetPayload<{}>
export type ArticleView = Prisma.ArticleViewGetPayload<{}>

export interface UserWithRelations extends User {
  achievements: UserAchievement[]
  pointTransactions: PointTransaction[]
  notifications: Notification[]
  referrals: Referral[]
  challengeCompletions: ChallengeCompletion[]
  scratchCards: ScratchCard[]
  redemptions: Redemption[]
}

export interface ArticleWithAuthor extends Omit<Article, "content"> {
  author: { name: string | null; image: string | null } | null
  _count?: { comments: number; bookmarks: number }
}

export interface LeaderboardEntry {
  position: number
  id: string
  username: string | null
  name: string | null
  image: string | null
  points: number
  xp: number
  level: number
  userRank: string
  achievementCount: number
}

export interface SiteSettingsData {
  siteName: string
  siteDescription: string
  scratchProbabilities: Record<string, number>
  adPointsReward: number
  dailyLoginPoints: number
  referralPoints: number
  articleReadPoints: number
  articleSharePoints: number
}

export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ScratchResult {
  reward: number
  cardId: string
}

export interface AdResult {
  pointsEarned: number
  scratchCardAwarded: boolean
}

export interface ChallengeProgress {
  id: string
  name: string
  description: string
  requirement: number
  progress: number
  completed: boolean
  points: number
  xp: number
  icon: string
  category: string
}

export interface DashboardData {
  user: UserWithRelations
  todaysChallenges: ChallengeProgress[]
  recentAchievements: (UserAchievement & { achievement: Achievement })[]
  recentTransactions: PointTransaction[]
  scratchCardCount: number
  dailyStreak: number
  levelProgress: { current: number; needed: number; percentage: number }
  notifications: Notification[]
  stats: {
    totalArticlesRead: number
    totalAdsWatched: number
    totalReferrals: number
    totalRedemptions: number
  }
}
