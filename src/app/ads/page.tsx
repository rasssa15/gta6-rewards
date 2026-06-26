"use client"
import { useState, useEffect, useRef } from "react"
import { Eye, Play, Star, TrendingUp, Loader2, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useWallet } from "@/components/providers/WalletProvider"
import toast from "react-hot-toast"
import Link from "next/link"
import { HTA_AD_URLS } from "@/lib/hta-ads"

export default function AdsPage() {
  const { walletId, points, refresh } = useWallet()
  const [watching, setWatching] = useState(false)
  const [timer, setTimer] = useState(12)
  const [lastResult, setLastResult] = useState<any>(null)
  const [adsWatched, setAdsWatched] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)
  const [adUrl, setAdUrl] = useState("")
  const [popupBlocked, setPopupBlocked] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

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

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const startWatching = () => {
    setLastResult(null)
    setWatching(true)
    setTimer(12)
    setPopupBlocked(false)
    const selectedUrl = HTA_AD_URLS[Math.floor(Math.random() * HTA_AD_URLS.length)]
    setAdUrl(selectedUrl)

    try {
      const win = window.open(selectedUrl, "_blank")
      if (!win || win.closed || typeof win.closed === "undefined") {
        setPopupBlocked(true)
      }
    } catch {
      setPopupBlocked(true)
    }

    intervalRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          return 0
        }
        return t - 1
      })
    }, 1000)
  }

  const handleComplete = async () => {
    if (!walletId) return
    setWatching(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
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

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="page-container max-w-2xl">
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
            <div className="grid grid-cols-2 gap-4 mb-6 max-w-sm mx-auto">
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

            <div className="glass-card p-0 overflow-hidden mb-6">
              <AnimatePresence mode="wait">
                {watching ? (
                  <motion.div
                    key="watching"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-6"
                  >
                    <div className="py-8 text-center">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-neon-green/20 to-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                        <Loader2 className="w-8 h-8 text-neon-green animate-spin" />
                      </div>
                      <p className="text-white font-semibold mb-1">Ad opened in new window</p>
                      <p className="text-gray-500 text-sm mb-6">Complete the ad offer to earn your reward</p>
                      
                      {popupBlocked && (
                        <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-xs text-yellow-500 max-w-xs mx-auto animate-in fade-in duration-200">
                          <p className="mb-2">Your browser blocked the popup window.</p>
                          <a
                            href={adUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setPopupBlocked(false)}
                            className="inline-flex items-center gap-1 font-bold underline hover:text-yellow-400"
                          >
                            Click here to open the ad manually
                          </a>
                        </div>
                      )}

                      <div className="flex items-center justify-center gap-2 mb-4">
                        <span className="text-3xl font-heading font-bold text-neon-green">{timer}s</span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-6 max-w-xs mx-auto">
                        <motion.div
                          className="h-full bg-neon-green rounded-full"
                          initial={{ width: "0%" }}
                          animate={{ width: `${(1 - timer / 12) * 100}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      {timer === 0 ? (
                        <button onClick={handleComplete} className="btn-primary !py-3 !px-8 font-bold flex items-center gap-2 mx-auto">
                          <Check className="w-5 h-5" /> Claim Reward
                        </button>
                      ) : (
                        <p className="text-xs text-gray-500">Wait for the timer to finish...</p>
                      )}
                    </div>
                  </motion.div>
                ) : lastResult ? (
                  <motion.div
                    key="result"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-8 text-center"
                  >
                    <div className={`w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                      lastResult.tier === "gold"
                        ? "bg-gradient-to-br from-yellow-500/20 to-amber-400/20"
                        : lastResult.tier === "silver"
                          ? "bg-gradient-to-br from-gray-300/20 to-gray-100/20"
                          : "bg-gradient-to-br from-amber-700/20 to-amber-500/20"
                    }`}>
                      <span className="text-4xl">{lastResult.emoji}</span>
                    </div>
                    <div className="text-3xl font-heading font-bold text-neon-green mb-1">+{lastResult.points}</div>
                    <div className="text-gray-400">{lastResult.label} Card</div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="ready"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-10 text-center"
                  >
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-neon-green/20 to-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                      <Eye className="w-10 h-10 text-neon-green" />
                    </div>
                    <p className="text-gray-300 text-lg font-semibold mb-2">Ready to earn?</p>
                    <p className="text-gray-500 text-sm mb-6">Watch a short ad and earn a random Scratch Card</p>
                    <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                      <span>🥉 Bronze 10x</span>
                      <span>🥈 Silver 1.5x</span>
                      <span>🥇 Gold 0.5x</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!watching && (
                <div className="px-6 pb-6">
                  <button
                    onClick={startWatching}
                    disabled={!walletId}
                    className="btn-primary w-full py-4 text-base font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Play className="w-5 h-5" />
                    {lastResult ? "Watch Another Ad" : "Watch Ad"}
                  </button>
                </div>
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
