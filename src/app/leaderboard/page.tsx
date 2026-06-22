"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Trophy, Medal, Crown, Award, User, ChevronRight, Flame, Star } from "lucide-react"

const periods = [
  { id: "all", label: "All Time", icon: Crown },
  { id: "monthly", label: "This Month", icon: Medal },
  { id: "weekly", label: "This Week", icon: Award },
  { id: "daily", label: "Today", icon: Flame },
]

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<any[]>([])
  const [period, setPeriod] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/leaderboard?period=${period}&limit=100`)
      .then((r) => r.json())
      .then((data) => {
        if (data.data) setLeaders(data.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [period])

  const rankColors = ["#FFD700", "#C0C0C0", "#CD7F32"]
  const rankIcons = [Crown, Medal, Medal]

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="page-container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-neon-yellow" />
            <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white">Leaderboard</h1>
          </div>
          <p className="text-gray-400">Top earners in the GTA 6 Rewards community</p>
        </motion.div>

        <div className="flex gap-2 mb-8">
          {periods.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
                period === p.id
                  ? "bg-gradient-to-r from-neon-pink to-neon-purple text-white"
                  : "glass text-gray-300 hover:text-white"
              }`}
            >
              <p.icon className="w-4 h-4" />
              {p.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="skeleton h-16 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="divide-y divide-white/5">
              {leaders.map((user, i) => {
                const RankIcon = i < 3 ? rankIcons[i] : null
                return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className={`flex items-center gap-4 p-4 hover:bg-white/5 transition-colors ${
                    i < 3 ? "bg-white/[0.02]" : ""
                  }`}
                >
                  <div className="w-10 text-center">
                    {RankIcon ? (
                      <RankIcon className="w-5 h-5 mx-auto" style={{ color: rankColors[i] }} />
                    ) : (
                      <span className="text-sm font-bold text-gray-500">#{i + 1}</span>
                    )}
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center text-sm font-bold text-white shrink-0">
                    {user.username?.[0] || user.name?.[0] || "U"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white truncate">
                        {user.username || user.name || "Anonymous"}
                      </span>
                      {user.userRank && (
                        <span className="badge-blue text-xs">{user.userRank}</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      Level {user.level} · {user.achievementCount} achievements
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold text-neon-yellow">
                      {user.points.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400">points</div>
                  </div>
                </motion.div>
                )
              })}
            </div>
          </div>
        )}

        {leaders.length === 0 && !loading && (
          <div className="glass-card p-12 text-center">
            <Trophy className="w-12 h-12 mx-auto text-gray-500 mb-4" />
            <p className="text-gray-400">No leaderboard data yet</p>
            <p className="text-gray-500 text-sm">Start earning points to appear here!</p>
          </div>
        )}
      </div>
    </div>
  )
}
