"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { Eye, Play, Loader2, Check } from "lucide-react"
import { useWallet } from "@/components/providers/WalletProvider"
import { LazyAd } from "@/components/ads/LazyAd"
import { AtOptionsAd } from "@/components/ads/AtOptionsAd"
import toast from "react-hot-toast"
import Link from "next/link"

export default function AdsPage() {
  useEffect(() => { document.title = "Watch Ads | GTA 6 Rewards" }, [])
  const { walletId, refresh } = useWallet()
  const [mode, setMode] = useState<"idle" | "video" | "done">("idle")
  const modeRef = useRef<"idle" | "video" | "done">("idle")
  const setModeSafe = (m: "idle" | "video" | "done") => {
    modeRef.current = m
    setMode(m)
  }
  const [adsWatched, setAdsWatched] = useState(0)
  const [claiming, setClaiming] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (walletId) {
      fetch(`/api/users/${walletId}`).then(r => r.json()).then(d => {
        setAdsWatched(d.adsWatched || 0)
      }).catch(() => {})
    }
  }, [walletId])

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
    setModeSafe("done")
  }, [walletId, claiming, refresh])

  const DIRECT_LINK = "https://www.effectivecpmnetwork.com/ferya5qq?key=0fdf4c14f0056af80dff7d2b13c4d1ee"

  const startAd = () => {
    setModeSafe("video")
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.src = "https://expensive-pollution.com/d/moFCzmd.GKNGvGZ/GnUh/peBm_9/u/Z/UFlXkFPHTjcSxeOHDaQ/4/OwD/kFt/NhzQEo4VN/Dwg/5tMowH"
        videoRef.current.play().catch(() => {
          window.open(DIRECT_LINK, "_blank")
          claimReward()
        })
      } else {
        window.open(DIRECT_LINK, "_blank")
        claimReward()
      }
    }, 500)

    setTimeout(() => {
      if (modeRef.current === "video") {
        window.open(DIRECT_LINK, "_blank")
        claimReward()
      }
    }, 8000)
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="page-container max-w-4xl">
        <div className="flex gap-4 mb-6 items-start">
          <div className="hidden lg:block shrink-0 w-[180px]">
            <LazyAd type="skyscraper" minHeight={600} />
          </div>
          <div className="flex-1 min-w-0">
            <LazyAd type="responsive" minHeight={90} className="mb-4" />
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
                    <div className="p-8 text-center relative aspect-video bg-black">
                      <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        playsInline
                        muted
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-10">
                        <Loader2 className="w-12 h-12 text-neon-green animate-spin mb-4" />
                        <p className="text-white font-semibold mb-2">Loading video ad...</p>
                        <p className="text-gray-300 text-xs">Please wait while the ad loads</p>
                      </div>
                    </div>
                  )}

                  {mode === "done" && (
                    <div className="p-10 text-center">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-neon-green/20 to-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                        <Check className="w-10 h-10 text-neon-green" />
                      </div>
                      <p className="text-white text-xl font-bold mb-1">Ad complete!</p>
                      <button onClick={() => setModeSafe("idle")} className="btn-primary w-full mt-6 py-4 text-base font-bold flex items-center justify-center gap-2">
                        <Play className="w-5 h-5" /> Watch Another Ad
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <AtOptionsAd adKey="bec02ef6fdbfe5fe80e15c3c4f9f4b58" width={300} height={250} />
              <AtOptionsAd adKey="bec02ef6fdbfe5fe80e15c3c4f9f4b58" width={300} height={250} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
