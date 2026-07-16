"use client"

import { useEffect, useRef, useState } from "react"

type Tier = "bronze" | "silver" | "gold"

const TIERS: Record<Tier, { label: string; color: string; glow: string }> = {
  bronze: { label: "BRONZE", color: "#b08d57", glow: "rgba(176,141,87,0.35)" },
  silver: { label: "SILVER", color: "#c0c7d1", glow: "rgba(192,199,209,0.35)" },
  gold: { label: "GOLD", color: "#facc15", glow: "rgba(250,204,21,0.45)" },
}

const CONFETTI = ["#a855f7", "#22d3ee", "#facc15", "#34d399", "#f472b6", "#60a5fa", "#fb923c"]

export function ScratchCard({
  points = 0,
  tier = "bronze",
  emoji = "🏆",
  label = "Reward",
  onReveal,
  onComplete,
}: {
  points?: number
  tier?: Tier
  emoji?: string
  label?: string
  onReveal?: () => void
  onComplete?: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const revealedRef = useRef(false)
  const [done, setDone] = useState(false)
  const [celebrate, setCelebrate] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = 224
    canvas.height = 224
    const ctx = canvas.getContext("2d", { willReadFrequently: true })
    if (!ctx) return
    ctxRef.current = ctx
    ctx.fillStyle = "#3a3a4a"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = "rgba(255,255,255,0.8)"
    ctx.font = "bold 15px system-ui, sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("SCRATCH HERE", canvas.width / 2, canvas.height / 2)
  }, [])

  const checkClearThreshold = () => {
    if (revealedRef.current) return
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    if (!canvas || !ctx) return
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
    let cleared = 0
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] === 0) cleared++
    }
    if (cleared / (data.length / 4) > 0.5) {
      revealedRef.current = true
      setDone(true)
      setCelebrate(true)
      onReveal?.()
      onComplete?.()
    }
  }

  const scratch = (clientX: number, clientY: number) => {
    if (revealedRef.current) return
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    if (!canvas || !ctx) return
    const rect = canvas.getBoundingClientRect()
    const x = ((clientX - rect.left) / rect.width) * canvas.width
    const y = ((clientY - rect.top) / rect.height) * canvas.height
    ctx.globalCompositeOperation = "destination-out"
    ctx.beginPath()
    ctx.arc(x, y, 22, 0, Math.PI * 2)
    ctx.fill()
  }

  const handleMove = (e: React.PointerEvent) => {
    if (e.buttons === 0 && e.pointerType === "mouse") return
    scratch(e.clientX, e.clientY)
  }
  const handleUp = () => checkClearThreshold()

  const tierStyle = TIERS[tier]

  return (
    <div className="relative w-[210px] h-[210px] mx-auto select-none">
      <style>{`
        .scratch-canvas { touch-action: none; border-radius: 16px; cursor: grab; }
        .scratch-canvas:active { cursor: grabbing; }
        .scratch-pop {
          animation: scratch-pop 0.6s cubic-bezier(0.18, 0.89, 0.32, 1.28) both;
        }
        .scratch-confetti {
          position: absolute; top: -10px; width: 8px; height: 12px; border-radius: 2px;
          animation: scratch-fall 1.1s ease-in forwards;
        }
        @keyframes scratch-pop {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes scratch-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(230px) rotate(360deg); opacity: 0; }
        }
      `}</style>

      {/* revealed content */}
      <div
        className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center text-center px-4"
        style={{
          background: `radial-gradient(circle at 50% 40%, ${tierStyle.glow}, rgba(20,20,30,0.9) 70%)`,
          boxShadow: `0 0 28px ${tierStyle.glow}`,
          border: `1px solid ${tierStyle.color}`,
        }}
      >
        <div className="text-5xl mb-2" style={{ filter: `drop-shadow(0 0 10px ${tierStyle.glow})` }}>
          {emoji}
        </div>
        <div className="text-white text-2xl font-extrabold tracking-tight">
          +{points.toFixed(2)}
        </div>
        <div
          className="text-[11px] font-bold tracking-[0.18em] mt-1"
          style={{ color: tierStyle.color }}
        >
          {tierStyle.label}
        </div>
        <div className="text-[10px] text-gray-400 mt-1">{label}</div>
      </div>

      {/* scratch overlay */}
      <canvas
        ref={canvasRef}
        className="scratch-canvas absolute inset-0 w-full h-full"
        style={{
          opacity: done ? 0 : 1,
          transition: "opacity 0.4s ease",
          pointerEvents: done ? "none" : "auto",
        }}
        onPointerDown={(e) => scratch(e.clientX, e.clientY)}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerLeave={handleUp}
      />

      {/* celebration */}
      {celebrate && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
          {CONFETTI.map((c, i) => (
            <span
              key={i}
              className="scratch-confetti"
              style={{
                background: c,
                left: `${8 + (i / CONFETTI.length) * 84}%`,
                animationDelay: `${i * 0.05}s`,
              }}
            />
          ))}
          <div
            className="scratch-pop text-4xl"
            style={{ filter: "drop-shadow(0 0 12px rgba(250,204,21,0.7))" }}
          >
            🎉
          </div>
        </div>
      )}
    </div>
  )
}
