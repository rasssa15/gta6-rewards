"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import { Sparkles, Target, CheckCircle, Gift, Eye, Star, RefreshCw, Play } from "lucide-react"
import { motion } from "framer-motion"
import { useWallet } from "@/components/providers/WalletProvider"
import { HTaAdPlayer } from "@/components/ads/HTaAdPlayer"
import toast from "react-hot-toast"

export default function ChallengesPage() {
  const { walletId, refresh } = useWallet()
  const [challenges, setChallenges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState<string | null>(null)
  const [showAd, setShowAd] = useState(false)
  const [adCooldown, setAdCooldown] = useState(0)
  const hasWatchedAdRef = useRef(false)

  const fetchChallenges = useCallback(() => {
    const params = new URLSearchParams()
    if (walletId) params.set("walletId", walletId)
    setLoading(true)
    fetch(`/api/challenges?${params}`)
      .then(r => r.json())
      .then(setChallenges)
      .catch(() => setChallenges([]))
      .finally(() => setLoading(false))
  }, [walletId])

  useEffect(() => { fetchChallenges() }, [fetchChallenges])

  useEffect(() => {
    const onFocus = () => fetchChallenges()
    window.addEventListener("focus", onFocus)
    return () => window.removeEventListener("focus", onFocus)
  }, [fetchChallenges])

  // Show ad every 30s after last view
  useEffect(() => {
    if (!walletId) return
    const interval = setInterval(() => {
      setAdCooldown((c) => {
        if (c <= 0) return 0
        return c - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [walletId])

  const triggerAd = () => {
    setShowAd(true)
  }

  const handleAdComplete = () => {
    setShowAd(false)
    setAdCooldown(30)
    hasWatchedAdRef.current = true
    fetchChallenges()
  }

  const handleClaim = async (challengeId: string) => {
    if (!walletId) return toast.error("Connect wallet first")

    if (!hasWatchedAdRef.current) {
      triggerAd()
      toast("Watch an ad to continue!")
      return
    }

    setClaiming(challengeId)
    try {
      const res = await fetch("/api/challenges/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletId, challengeId }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to claim")
        setClaiming(null)
        return
      }
      if (data.completed) {
        const count = data.scratchResults?.length || 1
        const totalPts = data.scratchResults?.reduce((s: number, r: any) => s + r.points, 0) || 0
        toast.success(`Claimed! +${data.xpReward} XP, ${count} cards (${totalPts} pts)!`)
        refresh()
      }
      setChallenges((prev) =>
        prev.map((c) =>
          c.id === challengeId
            ? { ...c, progress: data.progress, completed: data.completed }
            : c
        )
      )
    } catch {
      toast.error("Failed to claim")
    }
    setClaiming(null)
  }

  const isChest = (ch: any) => ["ad_20", "ad_40", "ad_75", "ad_100"].includes(ch.key)

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="page-container max-w-3xl">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-green to-neon-blue flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-white mb-2">Ad Challenges</h1>
          <p className="text-gray-400">Watch ads, hit milestones, earn big rewards</p>
          {walletId && (
            <button onClick={fetchChallenges} className="mt-3 text-xs text-gray-500 hover:text-neon-green transition-colors inline-flex items-center gap-1">
              <RefreshCw className="w-3 h-3" /> Refresh progress
            </button>
          )}
        </div>

        {showAd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="glass-card p-6 max-w-lg w-full">
              <h3 className="text-white font-semibold text-center mb-4">Watch an ad to continue</h3>
              <HTaAdPlayer onComplete={handleAdComplete} onSkip={handleAdComplete} minWatchSeconds={5} />
              <button onClick={() => setShowAd(false)} className="text-xs text-gray-500 hover:text-white mt-2 block mx-auto">Skip for now</button>
            </div>
          </div>
        )}

        {!walletId && (
          <div className="glass-card p-6 text-center mb-8">
            <p className="text-gray-400">Connect your wallet to track your ad challenge progress.</p>
          </div>
        )}

        {/* Inline banner ad */}
        {walletId && adCooldown === 0 && !showAd && (
          <div className="glass-card p-3 mb-6 text-center">
            <p className="text-xs text-gray-500 mb-2">Ad</p>
            <button onClick={triggerAd} className="btn-secondary text-sm !py-2 !px-4 inline-flex items-center gap-2">
              <Play className="w-3 h-3" /> Watch Ad to Support
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
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
            <h3 className="text-xl text-gray-400 font-semibold">No challenges available</h3>
            <p className="text-gray-600 text-sm mt-2">Check back later.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {challenges.map((challenge, i) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className={`glass-card p-5 ${challenge.completed ? "border-neon-green/30 opacity-70" : ""}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isChest(challenge)
                        ? "bg-gradient-to-br from-yellow-500/20 to-amber-400/20"
                        : "bg-gradient-to-br from-yellow-500/20 to-orange-500/20"
                    }`}>
                      {isChest(challenge) ? (
                        <Gift className="w-5 h-5 text-yellow-400" />
                      ) : (
                        <Star className="w-5 h-5 text-yellow-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-white font-semibold text-sm flex items-center gap-2 flex-wrap">
                        {challenge.title}
                        {challenge.completed && <CheckCircle className="w-3.5 h-3.5 text-neon-green shrink-0" />}
                      </h3>
                      <p className="text-gray-400 text-xs mt-0.5">{challenge.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Eye className="w-3 h-3" /> {challenge.target} ads
                        </span>
                        <span className="text-xs text-neon-purple font-mono">+{challenge.xpReward} XP</span>
                        {isChest(challenge) ? (
                          <span className="text-xs text-yellow-400 font-mono">🎁 5 cards</span>
                        ) : (
                          <span className="text-xs text-yellow-400 font-mono">🥇 Gold card</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleClaim(challenge.id)}
                    disabled={challenge.completed || !walletId || claiming === challenge.id || challenge.progress < challenge.target}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                      challenge.completed
                        ? "bg-neon-green/10 text-neon-green cursor-default"
                        : challenge.progress >= challenge.target
                          ? "bg-gradient-to-r from-neon-green to-emerald-500 text-white hover:shadow-lg hover:shadow-neon-green/20 animate-pulse"
                          : "glass text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {claiming === challenge.id ? (
                      <span className="animate-pulse">Claiming...</span>
                    ) : challenge.completed ? (
                      "Claimed ✓"
                    ) : challenge.progress >= challenge.target ? (
                      "Claim →"
                    ) : (
                      `${challenge.progress}/${challenge.target}`
                    )}
                  </button>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Ads watched</span>
                    <span>{(challenge.progress ?? 0)}/{challenge.target || "?"}</span>
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

        <div className="mt-10 glass-card p-6 text-center">
          <Eye className="w-8 h-8 text-neon-green mx-auto mb-2" />
          <h3 className="text-white font-semibold mb-1">How it works</h3>
          <p className="text-gray-400 text-sm">
            Every ad you watch counts toward these milestones. Progress auto-tracks — no manual steps needed.
            Hit the target and claim your reward!
          </p>
        </div>
      </div>
    </div>
  )
}
