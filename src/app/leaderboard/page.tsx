"use client"
import { useState, useEffect } from "react"
import { Trophy, Medal, TrendingUp, Clock, Calendar, Users, Star, Zap, Crown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const periods = [
  { key: "daily", label: "Daily", icon: Clock },
  { key: "weekly", label: "Weekly", icon: Calendar },
  { key: "monthly", label: "Monthly", icon: TrendingUp },
  { key: "all", label: "All Time", icon: Trophy },
]

const rankColors = [
  { text: "text-yellow-400", bg: "from-yellow-500/20 to-amber-400/10", border: "border-yellow-500/30", glow: "shadow-yellow-500/10" },
  { text: "text-gray-300",   bg: "from-gray-300/20 to-gray-400/10",   border: "border-gray-300/30",   glow: "shadow-gray-300/10" },
  { text: "text-amber-600",  bg: "from-amber-700/20 to-amber-500/10", border: "border-amber-600/30",  glow: "shadow-amber-600/10" },
]

const rankEmojis = ["🥇", "🥈", "🥉"]

function getLevelColor(level: number): string {
  if (level >= 50) return "from-red-500 to-orange-500"
  if (level >= 30) return "from-purple-500 to-pink-500"
  if (level >= 20) return "from-blue-500 to-cyan-500"
  if (level >= 10) return "from-green-500 to-emerald-500"
  return "from-gray-500 to-gray-600"
}

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

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="page-container max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="relative inline-flex mb-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-yellow-400/20 to-orange-500/10 flex items-center justify-center border border-yellow-400/20">
              <Trophy className="w-10 h-10 text-yellow-400" />
            </div>
            <span className="absolute -top-2 -right-2 text-2xl animate-bounce">👑</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-heading font-bold text-white mb-3">Leaderboard</h1>
          <p className="text-gray-400 max-w-sm mx-auto">
            Top GTA 6 Rewards players ranked by points. Rise through the ranks.
          </p>
        </motion.div>

        {/* Period tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center gap-2 mb-10 overflow-x-auto pb-2"
        >
          {periods.map((p) => {
            const Icon = p.icon
            return (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                  period === p.key
                    ? "bg-neon-yellow/15 text-neon-yellow border border-neon-yellow/30 shadow-lg shadow-neon-yellow/10"
                    : "glass text-gray-400 hover:text-white border border-transparent"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {p.label}
              </button>
            )
          })}
        </motion.div>

        {/* Top 3 podium */}
        {!loading && players.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-3 gap-3 mb-8"
          >
            {/* 2nd place */}
            <div className="flex flex-col items-center pt-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-300/20 to-gray-400/10 border border-gray-300/30 flex items-center justify-center mb-2 text-lg font-black text-white">
                {(players[1]?.name || "U").charAt(0).toUpperCase()}
              </div>
              <div className="text-[10px] text-gray-400 font-semibold truncate max-w-full px-1">{players[1]?.name || "Player"}</div>
              <div className="text-xs text-gray-300 font-mono font-bold mt-1">{players[1]?.points?.toLocaleString()} pts</div>
              <div className="text-2xl mt-2">🥈</div>
            </div>

            {/* 1st place */}
            <div className="flex flex-col items-center relative">
              <Crown className="w-6 h-6 text-yellow-400 mb-2 animate-pulse" />
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500/30 to-amber-400/10 border-2 border-yellow-400/40 flex items-center justify-center mb-2 text-xl font-black text-white shadow-lg shadow-yellow-500/20">
                {(players[0]?.name || "U").charAt(0).toUpperCase()}
              </div>
              <div className="text-[10px] text-yellow-300 font-bold truncate max-w-full px-1">{players[0]?.name || "Player"}</div>
              <div className="text-xs text-yellow-400 font-mono font-bold mt-1">{players[0]?.points?.toLocaleString()} pts</div>
              <div className="text-2xl mt-2">🥇</div>
            </div>

            {/* 3rd place */}
            <div className="flex flex-col items-center pt-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-700/20 to-amber-500/10 border border-amber-600/30 flex items-center justify-center mb-2 text-lg font-black text-white">
                {(players[2]?.name || "U").charAt(0).toUpperCase()}
              </div>
              <div className="text-[10px] text-gray-400 font-semibold truncate max-w-full px-1">{players[2]?.name || "Player"}</div>
              <div className="text-xs text-amber-600 font-mono font-bold mt-1">{players[2]?.points?.toLocaleString()} pts</div>
              <div className="text-2xl mt-2">🥉</div>
            </div>
          </motion.div>
        )}

        {/* Full list */}
        {loading ? (
          <div className="space-y-3">
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
            <Users className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl text-gray-400 font-semibold mb-2">No players yet</h3>
            <p className="text-gray-600 text-sm">Create a wallet and be the first on the board!</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={period}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              {players.map((player, i) => {
                const isTop3 = i < 3
                const rankStyle = isTop3 ? rankColors[i] : null
                return (
                  <motion.div
                    key={player.walletId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.02 }}
                    className={`glass-card p-4 flex items-center gap-4 border transition-all ${
                      isTop3
                        ? `bg-gradient-to-r ${rankStyle?.bg} border-opacity-50 ${rankStyle?.border} shadow-lg ${rankStyle?.glow}`
                        : "hover:border-white/15"
                    }`}
                  >
                    {/* Rank */}
                    <div className="w-8 text-center shrink-0">
                      {isTop3 ? (
                        <span className="text-xl">{rankEmojis[i]}</span>
                      ) : (
                        <span className="text-sm text-gray-600 font-mono font-bold">#{player.rank || i + 1}</span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getLevelColor(player.level || 1)} flex items-center justify-center shrink-0`}>
                      <span className="text-sm font-black text-white">
                        {(player.name || "U").charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold truncate ${isTop3 ? rankStyle?.text : "text-white"}`}>
                        {player.name || "Anonymous"}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-neon-purple" />
                          Lvl {player.level || 1}
                        </span>
                        {player.badges > 0 && (
                          <>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-neon-yellow" />
                              {player.badges} badges
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Points */}
                    <div className="text-right shrink-0">
                      <div className={`font-bold font-mono text-sm ${isTop3 ? rankStyle?.text : "text-neon-green"}`}>
                        {player.points?.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-gray-600">points</div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
