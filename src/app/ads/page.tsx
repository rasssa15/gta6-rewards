"use client"
import { useState, useEffect, useRef } from "react"
import { Eye, Play, Star, TrendingUp, Loader2, Check, SkipForward } from "lucide-react"
import { useWallet } from "@/components/providers/WalletProvider"
import toast from "react-hot-toast"
import Link from "next/link"

const AD_VIDEOS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
]

export default function AdsPage() {
  const { walletId, points, refresh } = useWallet()
  const [watching, setWatching] = useState(false)
  const [timer, setTimer] = useState(10)
  const [lastResult, setLastResult] = useState<any>(null)
  const [adsWatched, setAdsWatched] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)
  const [videoUrl, setVideoUrl] = useState("")
  const [adProgress, setAdProgress] = useState(0)
  const [adPlaying, setAdPlaying] = useState(false)
  const [adSkippable, setAdSkippable] = useState(false)
  const [adDone, setAdDone] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
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
    setTimer(10)
    setAdProgress(0)
    setAdPlaying(false)
    setAdSkippable(false)
    setAdDone(false)
    setVideoUrl(AD_VIDEOS[Math.floor(Math.random() * AD_VIDEOS.length)])

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

  useEffect(() => {
    if (watching && videoRef.current) {
      const v = videoRef.current
      v.muted = true
      v.playsInline = true
      v.preload = "auto"
      const t = setTimeout(() => {
        v.play().then(() => {
          setAdPlaying(true)
        }).catch(() => {
          setAdDone(true)
        })
      }, 300)
      return () => clearTimeout(t)
    }
  }, [watching, videoUrl])

  useEffect(() => {
    if (adSkippable || !adPlaying) return
    const t = setTimeout(() => setAdSkippable(true), 5000)
    return () => clearTimeout(t)
  }, [adPlaying, adSkippable])

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setAdProgress(Math.min((videoRef.current.currentTime / videoRef.current.duration) * 100, 100))
    }
  }

  const handleAdEnd = () => { setAdDone(true); setAdPlaying(false) }

  const skipAd = () => {
    if (videoRef.current) videoRef.current.currentTime = videoRef.current.duration
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
      {/* Full-screen ad overlay */}
      {watching && (
        <div className="fixed inset-0 z-50 bg-black" onClick={(e) => e.stopPropagation()}>
          <video
            ref={videoRef}
            src={videoUrl}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleAdEnd}
            className="w-full h-full object-cover"
            playsInline
            muted
            autoPlay
            preload="auto"
            controls={false}
            {...{"webkit-playsinline": "true", "x5-playsinline": "true"}}
          />
          {!adPlaying && !adDone && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-neon-green animate-spin mx-auto mb-3" />
                <p className="text-white/60 text-sm">Loading ad...</p>
              </div>
            </div>
          )}
          {adSkippable && !adDone && (
            <button
              onClick={skipAd}
              className="absolute bottom-8 right-6 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-sm text-white flex items-center gap-2 backdrop-blur-sm transition-all z-10"
            >
              <SkipForward className="w-4 h-4" /> Skip
            </button>
          )}
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/10 z-10">
            <div className="h-full bg-neon-green transition-all duration-300 ease-linear" style={{ width: `${Math.min(adProgress, 100)}%` }} />
          </div>
          {/* Timer */}
          {adPlaying && !adDone && (
            <div className="absolute top-6 left-6 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm text-white/80 text-sm font-mono z-10">
              {timer}s
            </div>
          )}
          {/* Claim overlay */}
          {(adDone || timer === 0) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
              <div className="text-center px-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-neon-green/20 to-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-10 h-10 text-neon-green" />
                </div>
                <h3 className="text-white text-2xl font-bold mb-2">Ad Complete!</h3>
                <p className="text-gray-400 mb-6">Your reward is ready</p>
                <button onClick={handleComplete} className="btn-primary !py-3 !px-10 text-lg font-bold flex items-center gap-2 mx-auto">
                  <Check className="w-5 h-5" /> Claim Reward
                </button>
              </div>
            </div>
          )}
        </div>
      )}

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
                {watching ? (
                  <div className="p-8 text-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-amber-400/20 flex items-center justify-center mx-auto mb-4">
                      <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
                    </div>
                    <p className="text-white font-semibold mb-1">Ad playing</p>
                    <p className="text-gray-400 text-xs mb-6">Watch the full-screen ad to earn your reward</p>

                    <div className="flex items-center justify-center gap-2 mb-4">
                      <span className="text-3xl font-heading font-bold text-neon-green">{timer}s</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-6 max-w-xs mx-auto">
                      <div className="h-full bg-neon-green rounded-full" />
                    </div>
                    {adDone || timer === 0 ? (
                      <button onClick={handleComplete} className="btn-primary !py-3 !px-8 font-bold flex items-center gap-2 mx-auto">
                        <Check className="w-5 h-5" /> Claim Reward
                      </button>
                    ) : (
                      <p className="text-xs text-gray-500">Watch the ad to earn your reward</p>
                    )}
                  </div>
                ) : lastResult ? (
                  <div className="p-8 text-center"
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
                  </div>
                ) : (
                  <div className="p-10 text-center"
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
                  </div>
                )}

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
