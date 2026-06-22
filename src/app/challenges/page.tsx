"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Award, BookOpen, Play, Share2, Sparkles, CheckCircle, Zap, Trophy, ArrowRight, RefreshCw } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

const challengeIcons: Record<string, any> = {
  BookOpen, Play, Share2, Sparkles, Globe: Award,
}

export default function ChallengesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [challenges, setChallenges] = useState<any[]>([])

  useEffect(() => {
    if (!session) { router.push("/auth/login"); return }
    fetch("/api/challenges/daily")
      .then((r) => r.json())
      .then((d) => { if (d.data) setChallenges(d.data) })
      .catch(() => {})
  }, [session, router])

  const handleComplete = async (challengeId: string) => {
    try {
      const res = await fetch("/api/challenges/daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Challenge complete! +${data.data.points} points, +${data.data.xp} XP`)
        setChallenges((prev) => prev.map((c) =>
          c.id === challengeId ? { ...c, completed: true } : c
        ))
      } else {
        toast.error(data.error || "Failed")
      }
    } catch { toast.error("Something went wrong") }
  }

  if (!session) return null

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="page-container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-8 h-8 text-neon-orange" />
            <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white">Challenges</h1>
          </div>
          <p className="text-gray-400">Complete challenges to earn bonus points and XP</p>
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
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className={`glass-card p-6 ${challenge.completed ? "border-neon-green/30" : ""}`}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                      challenge.completed ? "bg-neon-green/20 text-neon-green" : "glass text-gray-300"
                    }`}>
                      {challenge.completed ? (
                        <CheckCircle className="w-7 h-7" />
                      ) : (
                        <Icon className="w-7 h-7" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">{challenge.name}</h3>
                      <p className="text-sm text-gray-400">{challenge.description}</p>
                    </div>
                  </div>

                  <div className="progress-bar mb-3">
                    <div className="progress-fill" style={{ width: `${percentage}%` }} />
                  </div>

                  <div className="flex items-center justify-between text-sm mb-4">
                    <span className="text-gray-400">{progress}/{requirement}</span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-neon-yellow">
                        <Zap className="w-3 h-3" /> +{challenge.points}
                      </span>
                      <span className="flex items-center gap-1 text-neon-blue">
                        <Award className="w-3 h-3" /> +{challenge.xp} XP
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleComplete(challenge.id)}
                    disabled={challenge.completed || progress < requirement}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                      challenge.completed
                        ? "bg-neon-green/10 text-neon-green cursor-default"
                        : progress >= requirement
                        ? "bg-gradient-to-r from-neon-green to-neon-blue text-white hover:shadow-lg"
                        : "bg-white/5 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {challenge.completed ? (
                      <>Completed <CheckCircle className="w-4 h-4" /></>
                    ) : progress >= requirement ? (
                      <>Claim Reward <ArrowRight className="w-4 h-4" /></>
                    ) : (
                      "In Progress"
                    )}
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
