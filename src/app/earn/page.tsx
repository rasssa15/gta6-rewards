"use client"
import Link from "next/link"
import { Gift, Newspaper, Sparkles, Eye, RefreshCw, Users, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"

const earnMethods = [
  {
    icon: Newspaper,
    title: "Read Articles",
    desc: "Every article you read awards a Scratch Card. First 20 cards give 25–35 points total, then decreases.",
    points: "Scratch Card per read",
    link: "/news",
    color: "from-neon-blue/20 to-cyan-500/20",
  },
  {
    icon: Eye,
    title: "Watch Ads",
    desc: "Support the platform by watching ads. Each ad awards a Scratch Card toward your daily login.",
    points: "Scratch Card per ad",
    link: "/rewards",
    color: "from-neon-green/20 to-emerald-500/20",
  },
  {
    icon: Sparkles,
    title: "Complete Challenges",
    desc: "Daily challenges reward a Scratch Card on completion. New challenges every day.",
    points: "Scratch Card per challenge",
    link: "/challenges",
    color: "from-neon-purple/20 to-pink-500/20",
  },
  {
    icon: Gift,
    title: "Play Scratch Cards",
    desc: "Try your luck! First 20 cards pay 25–35 total, max 80. Cards past 20 give 1–2 points.",
    points: "1–3 per card",
    link: "/rewards",
    color: "from-neon-pink/20 to-rose-500/20",
  },
  {
    icon: Users,
    title: "Refer Friends",
    desc: "Invite friends. When they make their first redemption, you get 10 points + 20% of the reward.",
    points: "10 + 20% per referral",
    link: "/dashboard",
    color: "from-amber-500/20 to-orange-500/20",
  },
  {
    icon: RefreshCw,
    title: "Daily Login Gift",
    desc: "Watch 5 ads then claim your daily login gift — a free Scratch Card every day.",
    points: "Claim after 5 ads",
    link: "/dashboard",
    color: "from-sky-500/20 to-indigo-500/20",
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
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white flex items-center gap-3 mb-2">
            <Gift className="w-7 h-7 text-neon-green" />
            Earn Points
          </h1>
          <p className="text-gray-400 mb-8">
            No direct points — every task awards a Scratch Card. Stack your cards and watch the points grow.
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
                  className="glass-card p-5 flex items-start gap-4 group hover:border-neon-green/30 transition-all block"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold group-hover:text-neon-green transition-colors">
                      {method.title}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">{method.desc}</p>
                    <span className="inline-block mt-2 text-xs font-mono text-neon-green bg-neon-green/10 px-2 py-0.5 rounded">
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
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mt-8 glass-card p-6 text-center"
        >
          <h2 className="text-lg font-heading font-bold text-white mb-2">Leaderboard</h2>
          <p className="text-gray-400 text-sm mb-4">
            Compete with other players. Top earners get exclusive rewards.
          </p>
          <Link href="/leaderboard" className="btn-primary text-sm !px-6 !py-2.5 inline-flex items-center gap-2">
            <Users className="w-4 h-4" />
            View Leaderboard
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
