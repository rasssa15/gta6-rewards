"use client"
import { useState, useEffect } from "react"
import { Trophy, Medal, TrendingUp, Clock, Calendar, Users } from "lucide-react"
import { motion } from "framer-motion"
import { formatNumber } from "@/lib/utils"

const periods = [
  { key: "daily", label: "Daily", icon: Clock },
  { key: "weekly", label: "Weekly", icon: Calendar },
  { key: "monthly", label: "Monthly", icon: TrendingUp },
  { key: "all", label: "All Time", icon: Trophy },
]

const rankColors = ["text-yellow-400", "text-gray-300", "text-amber-600"]

export default function LeaderboardPage() {
  const [period, setPeriod] = useState("all")
  const [players, setPlayers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/leaderboard?period=${period}&limit=50`)
      .then(r => r.json())
      .then(setPlayers)
      .catch(() => setPlayers([]))
      .finally(() => setLoading(false))
  }, [period])

  const getLevelBadge = (level: number) => {
    if (level >= 50) return "bg-red-500"
    if (level >= 30) return "bg-purple-500"
    if (level >= 20) return "bg-blue-500"
    if (level >= 10) return "bg-green-500"
    return "bg-gray-500"
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="page-container">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-white mb-2">Leaderboard</h1>
          <p className="text-gray-400">Top players ranked by points</p>
        </div>

        <div className="flex justify-center gap-2 mb-8">
          {periods.map((p) => {
            const Icon = p.icon
            return (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
                  period === p.key
                    ? "bg-neon-blue/20 text-neon-blue border border-neon-blue/30"
                    : "glass text-gray-400 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                {p.label}
              </button>
            )
          })}
        </div>

        {loading ? (
          <div className="space-y-3 max-w-2xl mx-auto">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="glass-card p-4 flex items-center gap-4">
                <div className="w-8 h-8 rounded-full skeleton" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 skeleton" />
                  <div className="h-3 w-20 skeleton" />
                </div>
                <div className="h-6 w-16 skeleton" />
              </div>
            ))}
          </div>
        ) : players.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl text-gray-400 font-semibold">No players yet</h3>
            <p className="text-gray-600 text-sm mt-2">Create a wallet and start earning points!</p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-2">
            {players.map((player, i) => (
              <motion.div
                key={player.walletId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: i * 0.02 }}
                className={`glass-card p-4 flex items-center gap-4 ${
                  i < 3 ? "border-yellow-500/20" : ""
                }`}
              >
                <div className="w-8 text-center">
                  {i < 3 ? (
                    <Medal className={`w-6 h-6 ${rankColors[i]} mx-auto`} />
                  ) : (
                    <span className="text-sm text-gray-500 font-mono">#{player.rank}</span>
                  )}
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {(player.name || "U").charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold truncate">{player.name || "Anonymous"}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Level {player.level || 1}</span>
                    <span>·</span>
                    <span>{player.badges || 0} badges</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-neon-green font-bold font-mono">{player.points.toLocaleString()}</div>
                  <div className="text-[10px] text-gray-500">points</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
