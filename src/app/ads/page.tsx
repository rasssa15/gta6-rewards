"use client"
import { useState, useEffect } from "react"
import { Eye, Play, Star, TrendingUp, Gift } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useWallet } from "@/components/providers/WalletProvider"
import { HTaAdPlayer } from "@/components/ads/HTaAdPlayer"
import toast from "react-hot-toast"
import Link from "next/link"

export default function AdsPage() {
  const { walletId, points, refresh } = useWallet()
  const [watching, setWatching] = useState(false)
  const [lastResult, setLastResult] = useState<any>(null)
  const [adsWatched, setAdsWatched] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)

  useEffect(() => {
    if (walletId) {
      fetch(`/api/users/${walletId}`)
        .then(r => r.json())
        .then(d => {
          setAdsWatched(d.adsWatched || 0)
          setTotalPoints(d.points || 0)
        })
        .catch(() => {})
    }
  }, [walletId])

  const handleAdComplete = async () => {
    setWatching(false)
    try {
      const res = await fetch("/api/ads/watch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletId }),
      })
      const data = await res.json()
      if (res.ok) {
        setLastResult(data)
        setAdsWatched(data.adsWatched)
        toast.success(`${data.emoji} ${data.label} Card! +${data.points} pts`)
        refresh()
      } else {
        toast.error(data.error || "Failed")
      }
    } catch {
      toast.error("Network error")
    }
  }

  const handleAdSkip = () => {
    handleAdComplete()
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="page-container max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-green to-emerald-500 flex items-center justify-center mx-auto mb-4">
            <Eye className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-white mb-2">Watch Ads</h1>
          <p className="text-gray-400">Watch ads to earn random Scratch Cards</p>
        </div>

        {!walletId ? (
          <div className="glass-card p-8 text-center">
            <p className="text-gray-400">Connect your wallet to start earning.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="glass-card p-4 text-center">
                <Eye className="w-5 h-5 text-neon-green mx-auto mb-1" />
                <div className="text-2xl font-heading font-bold text-white">{adsWatched}</div>
                <div className="text-xs text-gray-500">Ads Watched</div>
              </div>
              <div className="glass-card p-4 text-center">
                <Star className="w-5 h-5 text-neon-yellow mx-auto mb-1" />
                <div className="text-2xl font-heading font-bold text-neon-yellow">{totalPoints}</div>
                <div className="text-xs text-gray-500">Total Points</div>
              </div>
            </div>

            <div className="glass-card p-6 text-center mb-6">
              <AnimatePresence mode="wait">
                {watching ? (
                  <motion.div
                    key="watching"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    <HTaAdPlayer onComplete={handleAdComplete} onSkip={handleAdSkip} minWatchSeconds={10} />
                    <p className="text-xs text-gray-500">Let the ad load, then click Done to earn!</p>
                  </motion.div>
                ) : lastResult ? (
                  <motion.div
                    key="result"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="py-4"
                  >
                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-3 ${
                      lastResult.tier === "gold"
                        ? "bg-gradient-to-br from-yellow-500/20 to-amber-400/20"
                        : lastResult.tier === "silver"
                          ? "bg-gradient-to-br from-gray-300/20 to-gray-100/20"
                          : "bg-gradient-to-br from-amber-700/20 to-amber-500/20"
                    }`}>
                      <span className="text-3xl">{lastResult.emoji}</span>
                    </div>
                    <div className="text-2xl font-heading font-bold text-neon-green">+{lastResult.points}</div>
                    <div className="text-gray-400 text-sm">{lastResult.label} Card</div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="ready"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-8"
                  >
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-neon-green/20 to-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                      <Play className="w-8 h-8 text-neon-green" />
                    </div>
                    <p className="text-gray-400 text-sm mb-1">Watch an ad</p>
                    <p className="text-gray-500 text-xs">Earn a random Scratch Card every time</p>
                    <div className="flex items-center justify-center gap-3 mt-4 text-xs text-gray-500">
                      <span>🥉 Bronze 10x</span>
                      <span>🥈 Silver 1.5x</span>
                      <span>🥇 Gold 0.5x</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!watching && (
                <button
                  onClick={() => {
                    setLastResult(null)
                    setWatching(true)
                  }}
                  disabled={!walletId}
                  className="btn-primary w-full mt-4 py-4 text-base font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Play className="w-5 h-5" />
                  {lastResult ? "Watch Another Ad" : "Watch Ad"}
                </button>
              )}
            </div>

            <div className="glass-card p-5">
              <h3 className="text-white font-semibold text-sm flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-neon-green" /> Ad Milestones
              </h3>
              <p className="text-xs text-gray-400 mb-3">
                Keep watching to unlock challenge rewards!
              </p>
              <Link href="/challenges" className="btn-secondary text-sm w-full text-center !py-2 block">
                View Challenges →
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
