"use client"
import { useState, useEffect } from "react"
import { HTA_AD_URLS } from "@/lib/hta-ads"
import { ExternalLink, Check, Loader2 } from "lucide-react"

interface HTaAdPlayerProps {
  onComplete: () => void
  onSkip?: () => void
  minWatchSeconds?: number
}

export function HTaAdPlayer({ onComplete, onSkip, minWatchSeconds = 8 }: HTaAdPlayerProps) {
  const [adUrl, setAdUrl] = useState("")
  const [timer, setTimer] = useState(minWatchSeconds)
  const [canComplete, setCanComplete] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [opened, setOpened] = useState(false)

  useEffect(() => {
    setAdUrl(HTA_AD_URLS[Math.floor(Math.random() * HTA_AD_URLS.length)])
  }, [])

  useEffect(() => {
    if (!adUrl) return
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(interval)
          setCanComplete(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [adUrl])

  const handleOpen = () => {
    if (!adUrl || opened) return
    setOpened(true)
    window.open(adUrl, "_blank", "width=800,height=600")
  }

  const handleComplete = () => {
    if (completed) return
    setCompleted(true)
    onComplete()
  }

  const handleSkip = () => {
    if (!canComplete) return
    onSkip?.()
    handleComplete()
  }

  return (
    <div className="text-center mb-4">
      <div className="rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-8 mb-3">
        {!opened ? (
          <>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-green/20 to-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <ExternalLink className="w-8 h-8 text-neon-green" />
            </div>
            <p className="text-white font-semibold mb-1">Click to open ad</p>
            <p className="text-gray-400 text-xs mb-4">A new tab will open. Come back after watching!</p>
            <button
              onClick={handleOpen}
              className="btn-primary !py-3 !px-8 flex items-center gap-2 mx-auto font-bold"
            >
              <ExternalLink className="w-4 h-4" /> Open Ad
            </button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-amber-400/20 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
            </div>
            <p className="text-white font-semibold mb-1">Ad opened in new tab</p>
            <p className="text-gray-400 text-xs mb-1">Watch the ad, then come back to claim!</p>
            {!canComplete && (
              <p className="text-yellow-400 text-sm font-mono font-bold">
                Wait {timer}s
              </p>
            )}
          </>
        )}
      </div>

      {canComplete && !completed && (
        <button
          onClick={handleComplete}
          className="btn-primary w-full !py-3 font-bold flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" /> Claim Reward
        </button>
      )}
    </div>
  )
}
