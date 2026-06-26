"use client"
import Link from "next/link"
import { Gift, Newspaper, Sparkles, Eye, RefreshCw, Users, ChevronRight, Coins, Zap, Trophy, Flame } from "lucide-react"
import { motion } from "framer-motion"

const earnMethods = [
  {
    icon: Newspaper,
    title: "📰 Read Articles",
    desc: "Stay updated with the latest GTA VI leaks and news. Every article you read drops a random Scratch Card — 🥉 Bronze (1-2 pts), 🥈 Silver (2-5 pts), or 🥇 Gold (5-10 pts)! Mostly Bronze, sometimes Silver, rarely Gold.",
    points: "🎴 Random Card per read",
    link: "/news",
    color: "from-neon-blue/20 to-cyan-500/20",
    emoji: "📰",
  },
  {
    icon: Eye,
    title: "📺 Watch Ads",
    desc: "Watch 1 full ad → get 1 random Scratch Card! 🥉 Bronze is most common (10x), 🥈 Silver pops up sometimes (1-2x), and 🥇 Gold is rare but huge (0.5x). The more ads you watch, the more cards you stack. Keep going!",
    points: "🥉🥈🥇 Random Card per ad",
    link: "/ads",
    color: "from-neon-green/20 to-emerald-500/20",
    emoji: "📺",
  },
  {
    icon: Sparkles,
    title: "⚡ Complete Challenges",
    desc: "Fresh challenges every day. Finish them, grab a random Scratch Card. Bronze fills your bag, Silver gives a boost, Gold is the jackpot. Keep completing!",
    points: "🥉🥈🥇 Per challenge",
    link: "/challenges",
    color: "from-neon-purple/20 to-pink-500/20",
    emoji: "⚡",
  },
  {
    icon: Gift,
    title: "🎰 Play Scratch Cards",
    desc: "Test your luck! Every card is 🥉 Bronze (1-2 pts), 🥈 Silver (2-5 pts), or 🥇 Gold (5-10 pts). Bronze comes often, Silver now and then, Gold is rare. Tap and see what you get!",
    points: "🥉1-2 · 🥈2-5 · 🥇5-10",
    link: "/dashboard",
    color: "from-neon-pink/20 to-rose-500/20",
    emoji: "🎰",
  },
  {
    icon: Users,
    title: "👥 Refer Friends",
    desc: "Got friends who love GTA? Invite them. When they make their first redemption, you score 10 points + 20% of their reward cost. Build your crew, earn bigger.",
    points: "10 🪙 + 20% per referral",
    link: "/dashboard",
    color: "from-amber-500/20 to-orange-500/20",
    emoji: "👥",
  },
  {
    icon: RefreshCw,
    title: "🎁 Daily Login Gift",
    desc: "Watch 5 ads → claim your daily Scratch Card. Completely free. Every single day. Log in, claim it, profit. Don't break the streak!",
    points: "Claim after 5 ads 🎴",
    link: "/dashboard",
    color: "from-sky-500/20 to-indigo-500/20",
    emoji: "🎁",
  },
]

const rewards = [
  {
    icon: Coins,
    title: "🥉 Bronze Coupon",
    desc: "Starter coupon for small game deals. Cheap, fast, and gets you in the game.",
    cost: "70 🪙",
    color: "from-amber-700/20 to-amber-500/20",
  },
  {
    icon: Zap,
    title: "🥈 Silver Coupon",
    desc: "Mid-tier coupon for the big titles. Save bigger, play harder.",
    cost: "160 🪙",
    color: "from-gray-300/20 to-gray-100/20",
  },
  {
    icon: Trophy,
    title: "🥇 Gold Coupon",
    desc: "Premium coupon — the ultimate reward. For players who grind to the top.",
    cost: "200 🪙",
    color: "from-yellow-500/20 to-amber-400/20",
  },
]

export default function EarnPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="page-container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Flame className="w-8 h-8 text-neon-orange animate-pulse" />
            <h1 className="text-3xl sm:text-5xl font-heading font-bold text-white">
              Earn <span className="bg-gradient-to-r from-neon-green to-neon-blue bg-clip-text text-transparent">Big</span>
            </h1>
          </div>
          <p className="text-gray-400 text-lg mb-2">
            <strong className="text-white">Every action</strong> gives you a random Scratch Card: <span className="text-amber-500 font-semibold">🥉 Bronze</span> · <span className="text-gray-300 font-semibold">🥈 Silver</span> · <span className="text-yellow-400 font-semibold">🥇 Gold</span>
          </p>
          <p className="text-gray-500 mb-8">
            Mostly Bronze, sometimes Silver, rarely Gold. <Link href="/ads" className="text-neon-green hover:underline">Watch ads on repeat</Link> for more cards!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {earnMethods.map((method, i) => {
            const Icon = method.icon
            return (
              <motion.div
                key={method.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Link
                  href={method.link}
                  className="glass-card p-5 flex items-start gap-4 group hover:border-neon-green/40 hover:shadow-lg hover:shadow-neon-green/5 transition-all block"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center shrink-0`}>
                    <span className="text-xl">{method.emoji}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold group-hover:text-neon-green transition-colors">
                      {method.title}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1 leading-relaxed">{method.desc}</p>
                    <span className="inline-block mt-2 text-xs font-mono font-semibold text-neon-green bg-neon-green/10 px-2.5 py-1 rounded-full">
                      {method.points}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-neon-green transition-colors shrink-0 mt-1" />
                </Link>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="mt-10 glass-card p-8 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-neon-green/5 to-neon-blue/5 pointer-events-none" />
          <Flame className="w-10 h-10 text-neon-orange mx-auto mb-3 animate-pulse" />
          <h2 className="text-xl font-heading font-bold text-white mb-2">🏆 Leaderboard</h2>
          <p className="text-gray-400 text-sm mb-5 max-w-md mx-auto">
            The grind is real. Climb the ranks, crush the competition, and earn bragging rights. Top players get exclusive perks.
          </p>
          <Link href="/leaderboard" className="btn-primary text-sm !px-8 !py-3 inline-flex items-center gap-2 font-bold">
            <Trophy className="w-4 h-4" />
            View Leaderboard
            <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
