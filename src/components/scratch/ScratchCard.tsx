"use client"
import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Gift, RefreshCw } from "lucide-react"
import toast from "react-hot-toast"

interface ScratchCardProps {
  card: { id: string; reward: number; status: string }
  onReveal?: (reward: number) => void
}

export function ScratchCardComponent({ card, onReveal }: ScratchCardProps) {
  const [isScratching, setIsScratching] = useState(false)
  const [isRevealed, setIsRevealed] = useState(false)
  const [reward, setReward] = useState<number | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawing = useRef(false)
  const progress = useRef(0)

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = 280
    canvas.height = 200

    ctx.fillStyle = "#1a1a2e"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, "#ff2d95")
    gradient.addColorStop(0.5, "#b829f0")
    gradient.addColorStop(1, "#00d4ff")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = "rgba(255,255,255,0.9)"
    ctx.font = "bold 16px system-ui"
    ctx.textAlign = "center"
    ctx.fillText("Scratch Here!", canvas.width / 2, canvas.height / 2 - 10)
    ctx.font = "14px system-ui"
    ctx.fillStyle = "rgba(255,255,255,0.6)"
    ctx.fillText("Use mouse to scratch", canvas.width / 2, canvas.height / 2 + 20)
  }, [])

  useEffect(() => {
    if (card.status === "unused") initCanvas()
  }, [card.status, initCanvas])

  const getPos = (e: any) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const touch = e.touches?.[0] || e
    return {
      x: (touch.clientX - rect.left) * (canvas.width / rect.width),
      y: (touch.clientY - rect.top) * (canvas.height / rect.height),
    }
  }

  const scratch = (x: number, y: number) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.globalCompositeOperation = "destination-out"
    ctx.beginPath()
    ctx.arc(x, y, 25, 0, Math.PI * 2)
    ctx.fill()

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const pixels = imageData.data
    let transparent = 0

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparent++
    }

    progress.current = (transparent / (pixels.length / 4)) * 100

    if (progress.current > 50 && !isRevealed) {
      setIsRevealed(true)
      setReward(card.reward)
      setShowConfetti(true)
      setIsScratching(false)
      onReveal?.(card.reward)

      setTimeout(() => setShowConfetti(false), 3000)
    }
  }

  const handleStart = (e: any) => {
    e.preventDefault()
    if (isRevealed || card.status !== "unused") return
    isDrawing.current = true
    setIsScratching(true)
    const pos = getPos(e)
    scratch(pos.x, pos.y)
  }

  const handleMove = (e: any) => {
    e.preventDefault()
    if (!isDrawing.current || isRevealed || card.status !== "unused") return
    const pos = getPos(e)
    scratch(pos.x, pos.y)
  }

  const handleEnd = () => {
    isDrawing.current = false
    setIsScratching(false)
  }

  const handleRevealServer = async () => {
    try {
      const res = await fetch("/api/scratch-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: card.id }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`+${data.data.reward} points from scratch card!`)
      }
    } catch {}
  }

  useEffect(() => {
    if (isRevealed && reward) {
      handleRevealServer()
    }
  }, [isRevealed, reward])

  if (card.status !== "unused") {
    return (
      <div className="glass-card p-6 text-center opacity-60">
        <Gift className="w-8 h-8 mx-auto mb-2 text-gray-500" />
        <p className="text-gray-400 text-sm">Already used</p>
        <p className="text-gray-500 text-xs">+{card.reward} points earned</p>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="glass-card overflow-hidden" style={{ width: 280, height: 200 }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence>
            {showConfetti && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-center"
              >
                <div className="text-4xl mb-2">🎉</div>
                <div className="text-2xl font-heading font-bold text-neon-yellow">
                  +{reward} Points!
                </div>
              </motion.div>
            )}
            {!isRevealed && (
              <div className="text-center">
                <Sparkles className="w-6 h-6 mx-auto text-neon-yellow mb-1" />
                <p className="text-xs text-gray-400">Scratch to reveal</p>
              </div>
            )}
          </AnimatePresence>
        </div>
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full cursor-crosshair"
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        />
      </div>
    </div>
  )
}
