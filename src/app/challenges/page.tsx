"use client"
import { useState, useEffect } from "react"
import { Sparkles, Target, CheckCircle, RotateCcw, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { useWallet } from "@/components/providers/WalletProvider"
import toast from "react-hot-toast"

export default function ChallengesPage() {
  const { walletId, refresh } = useWallet()
  const [challenges, setChallenges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams()
    if (walletId) params.set("userId", walletId)

    fetch(`/api/challenges?${params}`)
      .then(r => r.json())
      .then(setChallenges)
      .catch(() => setChallenges([]))
      .finally(() => setLoading(false))
  }, [walletId])

  const handleComplete = async (challengeId: string) => {
    if (!walletId) return toast.error("Connect wallet first")
    try {
      const res = await fetch("/api/challenges/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: walletId, challengeId }),
      })
      const data = await res.json()
      if (data.completed) {
        toast.success(`Challenge complete! +${data.pointReward} pts`)
        refresh()
      } else {
        toast.success(`Progress: ${data.progress}/${data.target}`)
      }
      setChallenges((prev) =>
        prev.map((c) =>
          c.id === challengeId
            ? { ...c, progress: data.progress, completed: data.completed }
            : c
        )
      )
    } catch {}
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="page-container max-w-3xl">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-white mb-2">Daily Challenges</h1>
          <p className="text-gray-400">Complete challenges to earn points and XP</p>
        </div>

        {!walletId && (
          <div className="glass-card p-6 text-center mb-8">
            <p className="text-gray-400">Connect your wallet to start completing challenges.</p>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass-card p-6 space-y-3">
                <div className="h-5 w-48 skeleton" />
                <div className="h-4 w-64 skeleton" />
                <div className="h-2 w-full skeleton" />
              </div>
            ))}
          </div>
        ) : challenges.length === 0 ? (
          <div className="text-center py-20">
            <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl text-gray-400 font-semibold">No challenges today</h3>
            <p className="text-gray-600 text-sm mt-2">Check back later for new challenges.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {challenges.map((challenge, i) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className={`glass-card p-6 ${challenge.completed ? "border-neon-green/30" : ""}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      {challenge.title}
                      {challenge.completed && (
                        <CheckCircle className="w-4 h-4 text-neon-green" />
                      )}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">{challenge.description}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-xs text-neon-green font-mono">+{challenge.pointReward} pts</span>
                      <span className="text-xs text-neon-purple font-mono">+{challenge.xpReward} XP</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <button
                      onClick={() => handleComplete(challenge.id)}
                      disabled={challenge.completed || !walletId}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                        challenge.completed
                          ? "bg-neon-green/10 text-neon-green"
                          : walletId
                            ? "btn-primary !px-4 !py-2"
                            : "glass text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {challenge.completed ? "Done" : walletId ? "Complete" : "Locked"}
                    </button>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{challenge.progress}/{challenge.target}</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${Math.min((challenge.progress / challenge.target) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
