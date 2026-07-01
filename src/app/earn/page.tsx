"use client"
import Link from "next/link"
import { Gift, Newspaper, Sparkles, Eye, RefreshCw, Users, ChevronRight, Coins, Zap, Trophy, Flame } from "lucide-react"
import { AdBanner } from "@/components/ads/AdBanner"

const earnMethods = [
  {
    icon: Newspaper,
    title: "Read Articles",
    desc: "Read articles and get scratch cards.",
    points: "Random Card per read",
    link: "/news",
    color: "from-neon-blue/20 to-cyan-500/20",
    emoji: "📰",
  },
  {
    icon: Eye,
    title: "Watch Ads",
    desc: "Watch ads and earn scratch cards.",
    points: "Random Card per ad",
    link: "/ads",
    color: "from-neon-green/20 to-emerald-500/20",
    emoji: "📺",
  },
  {
    icon: Sparkles,
    title: "Complete Challenges",
    desc: "Complete daily challenges for scratch cards.",
    points: "Per challenge",
    link: "/challenges",
    color: "from-neon-purple/20 to-pink-500/20",
    emoji: "⚡",
  },
  {
    icon: Gift,
    title: "Play Scratch Cards",
    desc: "Test your luck and win points.",
    points: "1-10 per card",
    link: "/dashboard",
    color: "from-neon-pink/20 to-rose-500/20",
    emoji: "🎰",
  },
  {
    icon: Users,
    title: "Refer Friends",
    desc: "Invite friends and earn bonuses when they redeem.",
    points: "10 + 20% per referral",
    link: "/dashboard",
    color: "from-amber-500/20 to-orange-500/20",
    emoji: "👥",
  },
  {
    icon: RefreshCw,
    title: "Daily Login Gift",
    desc: "Watch 5 ads and claim your daily scratch card.",
    points: "Claim after 5 ads",
    link: "/dashboard",
    color: "from-sky-500/20 to-indigo-500/20",
    emoji: "🎁",
  },
]

export default function EarnPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="page-container max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-5xl font-heading font-bold text-white mb-2">
            Earn <span className="bg-gradient-to-r from-neon-green to-neon-blue bg-clip-text text-transparent">Big</span>
          </h1>
          <p className="text-gray-400">Every action gives you a random Scratch Card</p>
        </div>

        <div className="mb-8">
          <AdBanner adKey="7e7419c72404cab7787c27dfdac31321" height={90} width={728} className="flex justify-center" />
        </div>

        <div className="flex justify-center mb-8">
          <AdBanner adKey="earn-sidebar" height={300} width={160} className="flex justify-center" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {earnMethods.map((method) => {
            const Icon = method.icon
            return (
              <Link
                key={method.title}
                href={method.link}
                className="glass-card p-5 flex items-start gap-4 group block"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center shrink-0`}>
                  <span className="text-xl">{method.emoji}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold group-hover:text-neon-green">
                    {method.title}
                  </h3>
                  <p className="text-gray-400 text-sm mt-1 leading-relaxed">{method.desc}</p>
                  <span className="inline-block mt-2 text-xs font-mono font-semibold text-neon-green bg-neon-green/10 px-2.5 py-1 rounded-full">
                    {method.points}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-neon-green shrink-0 mt-1" />
              </Link>
            )
          })}
        </div>

        <div className="mt-10">
          <AdBanner adKey="a32d05859c7cdc4b19c45ea2746367ad" height={50} width={320} className="flex justify-center" />
        </div>

        <div className="mt-10 glass-card p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-neon-green/5 to-neon-blue/5 pointer-events-none" />
          <Flame className="w-10 h-10 text-neon-orange mx-auto mb-3 opacity-80" />
          <h2 className="text-xl font-heading font-bold text-white mb-2">Leaderboard</h2>
          <p className="text-gray-400 text-sm mb-5 max-w-md mx-auto">
            The grind is real. Climb the ranks, crush the competition, and earn bragging rights. Top players get exclusive perks.
          </p>
          <Link href="/leaderboard" className="btn-primary text-sm !px-8 !py-3 inline-flex items-center gap-2 font-bold">
            <Trophy className="w-4 h-4" />
            View Leaderboard
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex justify-center mt-10">
          <AdBanner adKey="earn-bottom" height={60} width={468} className="flex justify-center" />
        </div>
      </div>
    </div>
  )
}
