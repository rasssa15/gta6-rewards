"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { Eye, Play, Star, ExternalLink, AlertCircle, Loader2, Check } from "lucide-react"
import { useWallet } from "@/components/providers/WalletProvider"
import toast from "react-hot-toast"
import Link from "next/link"

const VIDEO_AD_URL = "https://expensive-pollution.com/d/moFCzmd.GKNGvGZ/GnUh/peBm_9/u/Z/UFlXkFPHTjcSxeOHDaQ/4/OwD/kFt/NhzQEo4VN/Dwg/5tMowH"
const DIRECT_LINKS = [
  "https://www.effectivecpmnetwork.com/ferya5qq?key=0fdf4c14f0056af80dff7d2b13c4d1ee",
  "https://pleased-report.com/JahekC",
  "https://www.effectivecpmnetwork.com/ferya5qq?key=0fdf4c14f0056af80dff7d2b13c4d1ee",
  "https://pleased-report.com/JahekC",
  "https://www.effectivecpmnetwork.com/ferya5qq?key=0fdf4c14f0056af80dff7d2b13c4d1ee",
]
const COOLDOWN_SECONDS = 5

export default function AdsPage() {
  const { walletId, refresh } = useWallet()
  const [mode, setMode] = useState<"idle" | "video" | "links" | "done">("idle")
  const [videoError, setVideoError] = useState(false)
  const [completedLinks, setCompletedLinks] = useState(0)
  const [cooldown, setCooldown] = useState(0)
  const [adsWatched, setAdsWatched] = useState(0)
  const [claiming, setClaiming] = useState(false)
  const cooldownRef = useRef<number | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (walletId) {
      fetch(`/api/users/${walletId}`).then(r => r.json()).then(d => {
        setAdsWatched(d.adsWatched || 0)
      }).catch(() => {})
    }
  }, [walletId])

  const clearCooldown = () => {
    if (cooldownRef.current) clearInterval(cooldownRef.current)
    setCooldown(0)
  }

  const claimReward = useCallback(async () => {
    if (!walletId || claiming) return
    setClaiming(true)
    try {
      const res = await fetch("/api/ads/watch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletId }),
      })
      const data = await res.json()
      if (data.error) { toast.error(data.error); return }
      setAdsWatched(data.adsWatched)
      refresh()
    } catch { toast.error("Network error") }
    setClaiming(false)
    setMode("done")
  }, [walletId, claiming, refresh])

  const startAd = () => {
    setVideoError(false)
    setCompletedLinks(0)
    setMode("video")
    clearCooldown()

    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.src = VIDEO_AD_URL
        videoRef.current.play().catch(() => {
          setVideoError(true)
          setMode("links")
        })
      } else {
        setVideoError(true)
        setMode("links")
      }
    }, 500)

    setTimeout(() => {
      if (!videoError && mode === "video") {
        setVideoError(true)
        setMode("links")
      }
    }, 8000)
  }

  const openLink = (index: number) => {
    if (index !== completedLinks || cooldown > 0) return
    try { window.open(DIRECT_LINKS[index], "_blank") } catch {}
    setCompletedLinks(prev => prev + 1)
    setCooldown(COOLDOWN_SECONDS)
    cooldownRef.current = window.setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) { window.clearInterval(cooldownRef.current!); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  useEffect(() => {
    if (completedLinks >= 5 && !claiming) {
      clearCooldown()
      claimReward()
    }
  }, [completedLinks, claiming, claimReward])

  useEffect(() => {
    return () => clearCooldown()
  }, [])

  const videoEnded = () => { claimReward() }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="page-container max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-green to-emerald-500 flex items-center justify-center mx-auto mb-4">
            <Eye className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-white mb-2">Watch Ads</h1>
          <p className="text-gray-400">Watch ads to earn rewards</p>
        </div>

        {!walletId ? (
          <div className="glass-card p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-neon-purple" />
            </div>
            <h3 className="text-white font-semibold mb-2">Wallet Required</h3>
            <p className="text-gray-400 text-sm mb-6">Create or unlock your wallet to start earning rewards from ads.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/wallet/create" className="btn-primary !py-2.5 !px-6 text-sm font-semibold">Create Wallet</Link>
              <Link href="/wallet/login" className="btn-secondary !py-2.5 !px-6 text-sm font-semibold">Unlock Wallet</Link>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <div className="glass-card p-4 text-center w-32">
                <Eye className="w-5 h-5 text-neon-green mx-auto mb-1" />
                <div className="text-2xl font-heading font-bold text-white">{adsWatched}</div>
                <div className="text-xs text-gray-500">Ads Watched</div>
              </div>
            </div>

            <div className="glass-card p-0 overflow-hidden mb-6">
              {mode === "idle" && (
                <div className="p-10 text-center">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-neon-green/20 to-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <Eye className="w-10 h-10 text-neon-green" />
                  </div>
                  <p className="text-gray-300 text-lg font-semibold mb-6">Ready to earn?</p>
                  <button onClick={startAd} className="btn-primary w-full py-4 text-base font-bold flex items-center justify-center gap-2">
                    <Play className="w-5 h-5" /> Start Ad
                  </button>
                </div>
              )}

              {mode === "video" && (
                <div className="p-8 text-center">
                  <video ref={videoRef} className="hidden" onEnded={videoEnded} />
                  <Loader2 className="w-12 h-12 text-neon-green animate-spin mx-auto mb-4" />
                  <p className="text-white font-semibold mb-2">Loading video ad...</p>
                  <p className="text-gray-400 text-xs">If video doesn&apos;t load, you&apos;ll be prompted to open direct links.</p>
                </div>
              )}

              {mode === "links" && (
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                    <p className="text-amber-400 font-semibold text-sm">Ad couldn&apos;t load. Open all 5 links to earn your reward!</p>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    {Array.from({ length: 5 }, (_, i) => (
                      <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${
                        i < completedLinks ? "bg-neon-green text-black" : i === completedLinks ? "bg-white/10 text-white border border-white/30" : "bg-white/5 text-gray-600"
                      }`}>
                        {i < completedLinks ? <Check className="w-4 h-4" /> : i + 1}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {DIRECT_LINKS.map((link, i) => {
                      const done = i < completedLinks
                      const active = i === completedLinks && cooldown === 0
                      const waiting = i === completedLinks && cooldown > 0
                      const locked = i > completedLinks
                      return (
                        <button
                          key={i}
                          onClick={() => openLink(i)}
                          disabled={!active}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg text-left text-sm transition-all ${
                            done ? "bg-neon-green/10 text-neon-green border border-neon-green/30" :
                            active ? "bg-white/10 text-white border border-white/20 hover:bg-white/20 cursor-pointer" :
                            "bg-white/5 text-gray-600 border border-white/5 cursor-not-allowed"
                          }`}
                        >
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            done ? "bg-neon-green text-black" : active ? "bg-white/20 text-white" : "bg-white/10 text-gray-600"
                          }`}>
                            {done ? <Check className="w-3 h-3" /> : locked ? "🔒" : i + 1}
                          </span>
                          <span className="flex-1 truncate">{link.replace(/https?:\/\//, "")}</span>
                          {active && !done && <ExternalLink className="w-4 h-4 shrink-0" />}
                          {waiting && <span className="text-xs text-amber-400 shrink-0">{cooldown}s</span>}
                          {done && <span className="text-xs text-neon-green shrink-0">Done</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {mode === "done" && (
                <div className="p-10 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-neon-green/20 to-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-10 h-10 text-neon-green" />
                  </div>
                  <p className="text-white text-xl font-bold mb-1">Ad complete!</p>
                  <button onClick={() => setMode("idle")} className="btn-primary w-full mt-6 py-4 text-base font-bold flex items-center justify-center gap-2">
                    <Play className="w-5 h-5" /> Watch Another Ad
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
