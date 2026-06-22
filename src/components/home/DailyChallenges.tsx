"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Award, BookOpen, Play, Share2, Sparkles, CheckCircle, Zap } from "lucide-react"

const challengeIcons: Record<string, any> = {
  BookOpen, Play, Share2, Sparkles, Globe: Award
}

export function DailyChallenges() {
  const [challenges, setChallenges] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/challenges/daily")
      .then((r) => r.json())
      .then((data) => {
        if (data.data) setChallenges(data.data)
      })
      .catch(() => {})
  }, [])

  return (
    <section className="py-16 sm:py-20">
      <div className="page-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-6 h-6 text-neon-orange" />
            <h2 className="section-title mb-0">Daily Challenges</h2>
          </div>
          <p className="section-subtitle mb-8">Complete challenges and earn bonus points</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {challenges.map((challenge, i) => {
            const Icon = challengeIcons[challenge.icon] || Award
            const progress = challenge.progress || 0
            const requirement = challenge.requirement || 1
            const percentage = Math.min((progress / requirement) * 100, 100)

            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <div className={`glass-card p-5 ${challenge.completed ? "border-neon-green/30" : ""}`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      challenge.completed
                        ? "bg-neon-green/20 text-neon-green"
                        : "glass text-gray-300"
                    }`}>
                      {challenge.completed ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-white mb-1">
                        {challenge.name}
                      </h3>
                      <p className="text-xs text-gray-400 mb-3">
                        {challenge.description}
                      </p>
                      <div className="progress-bar mb-2">
                        <div
                          className="progress-fill"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">
                          {progress}/{requirement}
                        </span>
                        <span className="flex items-center gap-1 text-neon-yellow font-medium">
                          <Zap className="w-3 h-3" />
                          +{challenge.points} pts
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
