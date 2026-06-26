"use client"
import { useState, useEffect, useRef } from "react"
import { HTA_AD_URLS } from "@/lib/hta-ads"

interface HTaAdPlayerProps {
  onComplete: () => void
  onSkip?: () => void
  minWatchSeconds?: number
}

export function HTaAdPlayer({ onComplete, onSkip, minWatchSeconds = 8 }: HTaAdPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [adUrl, setAdUrl] = useState("")
  const [loaded, setLoaded] = useState(false)
  const [timer, setTimer] = useState(minWatchSeconds)
  const [canSkip, setCanSkip] = useState(false)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    setAdUrl(HTA_AD_URLS[Math.floor(Math.random() * HTA_AD_URLS.length)])
  }, [])

  useEffect(() => {
    if (!adUrl) return
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(interval)
          setCanSkip(true)
          setLoaded(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [adUrl])

  const handleComplete = () => {
    if (completed) return
    setCompleted(true)
    onComplete()
  }

  const handleSkip = () => {
    if (!canSkip) return
    onSkip?.()
    handleComplete()
  }

  return (
    <div className="relative rounded-xl overflow-hidden bg-black mb-4">
      <iframe
        ref={iframeRef}
        src={adUrl}
        className="w-full aspect-video"
        style={{ minHeight: 250 }}
        allow="autoplay; fullscreen; payment; microphone; camera; display-capture"
      />
      <div className="absolute top-3 right-3 flex items-center gap-2">
        {!canSkip && (
          <span className="px-2 py-1 rounded-lg bg-white/10 text-xs text-white font-mono">
            {timer}s
          </span>
        )}
        {canSkip && !completed && (
          <button
            onClick={handleSkip}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white transition-all"
          >
            Skip
          </button>
        )}
        {!loaded && (
          <span className="px-2 py-1 rounded-lg bg-black/50 text-xs text-gray-400">
            Loading ad...
          </span>
        )}
      </div>
      {canSkip && !completed && (
        <button
          onClick={handleComplete}
          className="absolute bottom-3 right-3 px-4 py-2 rounded-lg bg-neon-green/20 hover:bg-neon-green/30 text-xs text-neon-green font-semibold transition-all"
        >
          Done ✓
        </button>
      )}
    </div>
  )
}
