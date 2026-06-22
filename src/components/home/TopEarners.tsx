"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Trophy, Medal, Crown } from "lucide-react"

export function TopEarners() {
  const [leaders, setLeaders] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/leaderboard?period=all&limit=5")
      .then((r) => r.json())
      .then((data) => {
        if (data.data) setLeaders(data.data)
      })
      .catch(() => {})
  }, [])

  const rankIcons = [Crown, Medal, Medal]
  const rankColors = ["text-neon-yellow", "text-gray-300", "text-amber-600"]

  return (
    <section className="py-16 sm:py-20">
      <div className="page-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-6 h-6 text-neon-yellow" />
            <h2 className="section-title mb-0">Top Earners</h2>
          </div>
          <p className="section-subtitle mb-8">Leading the leaderboard this week</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="glass-card overflow-hidden">
              <div className="divide-y divide-white/5">
                {leaders.map((user, i) => {
                  const RankIcon = i < 3 ? rankIcons[i] : null
                  return (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="w-8 text-center">
                      {RankIcon ? (
                        <RankIcon className={`w-5 h-5 ${rankColors[i]} mx-auto`} />
                      ) : (
                        <span className="text-sm font-bold text-gray-500">#{i + 1}</span>
                      )}
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center text-sm font-bold text-white shrink-0">
                      {user.username?.[0] || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white truncate">
                        {user.username || user.name || "Anonymous"}
                      </div>
                      <div className="text-xs text-gray-400">
                        Level {user.level} {user.userRank}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-neon-yellow">
                        {user.points.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400">pts</div>
                    </div>
                  </motion.div>
                )
                })}
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card p-6 flex flex-col items-center justify-center text-center"
          >
            <Trophy className="w-12 h-12 text-neon-yellow mb-4" />
            <h3 className="text-xl font-heading font-bold text-white mb-2">
              Compete for the Top
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Earn points, complete challenges, and climb the leaderboard to become the #1 earner.
            </p>
            <a href="/leaderboard" className="btn-primary text-sm">
              View Full Leaderboard
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
