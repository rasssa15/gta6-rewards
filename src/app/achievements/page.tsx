"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Award, Lock, Unlock, Sparkles, Trophy, Star, Shield } from "lucide-react"
import { useSession } from "next-auth/react"

const categoryIcons: Record<string, any> = {
  general: Star,
  rewards: Trophy,
  scratch: Sparkles,
  reading: Award,
  ads: Shield,
  referral: Trophy,
  points: Star,
  streak: Award,
  challenges: Trophy,
}

const categoryColors: Record<string, string> = {
  general: "from-neon-blue to-neon-purple",
  rewards: "from-neon-yellow to-neon-orange",
  scratch: "from-neon-pink to-neon-purple",
  reading: "from-neon-green to-neon-blue",
  ads: "from-neon-purple to-neon-pink",
  referral: "from-neon-yellow to-neon-green",
  points: "from-neon-orange to-neon-yellow",
  streak: "from-neon-red to-neon-orange",
  challenges: "from-neon-blue to-neon-green",
}

export default function AchievementsPage() {
  const { data: session } = useSession()
  const [achievements, setAchievements] = useState<any[]>([])
  const [stats, setStats] = useState({ total: 0, unlocked: 0 })

  useEffect(() => {
    fetch("/api/achievements")
      .then((r) => r.json())
      .then((d) => {
        if (d.data) {
          setAchievements(d.data)
          if (d.stats) setStats(d.stats)
        }
      })
      .catch(() => {})
  }, [])

  const categories = [...new Set(achievements.map((a) => a.category))]

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="page-container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-neon-yellow" />
            <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white">Achievements</h1>
          </div>
          <p className="text-gray-400 mb-4">Unlock achievements by completing various actions</p>

          <div className="flex items-center gap-4">
            <div className="glass-card px-4 py-3">
              <span className="text-2xl font-heading font-bold text-neon-yellow">{stats.unlocked}</span>
              <span className="text-sm text-gray-400 ml-2">/ {stats.total} Unlocked</span>
            </div>
            <div className="flex-1 progress-bar max-w-md">
              <div
                className="progress-fill"
                style={{ width: `${stats.total > 0 ? (stats.unlocked / stats.total) * 100 : 0}%` }}
              />
            </div>
          </div>
        </motion.div>

        {categories.map((category) => {
          const catAchievements = achievements.filter((a) => a.category === category)
          const unlocked = catAchievements.filter((a) => a.unlocked).length
          const Icon = categoryIcons[category] || Award
          const colors = categoryColors[category] || "from-neon-blue to-neon-purple"

          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colors} flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-heading font-bold text-white capitalize">{category}</h2>
                <span className="text-sm text-gray-400">({unlocked}/{catAchievements.length})</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {catAchievements.map((achievement, i) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className={`glass-card p-5 flex items-start gap-4 ${
                      achievement.unlocked ? "border-neon-green/20" : "opacity-70"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      achievement.unlocked
                        ? `bg-gradient-to-br ${colors}`
                        : "bg-white/5"
                    }`}>
                      {achievement.unlocked ? (
                        <Trophy className="w-6 h-6 text-white" />
                      ) : (
                        <Lock className="w-6 h-6 text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`text-sm font-semibold ${achievement.unlocked ? "text-white" : "text-gray-300"}`}>
                          {achievement.name}
                        </h3>
                        {achievement.unlocked && (
                          <Unlock className="w-3 h-3 text-neon-green" />
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mb-2">{achievement.description}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-neon-yellow">+{achievement.points} pts</span>
                        <span className="text-gray-500">·</span>
                        <span className="text-neon-blue">+{achievement.xp} XP</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
