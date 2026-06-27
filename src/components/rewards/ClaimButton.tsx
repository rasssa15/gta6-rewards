"use client"
import { useRef, useState } from "react"
import { motion } from "framer-motion"

interface ClaimButtonProps {
  onClick: () => void
  label?: string
  disabled?: boolean
}

export default function ClaimButton({
  onClick,
  label = "Claim Reward",
  disabled = false,
}: ClaimButtonProps) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([])
  const btnRef = useRef<HTMLButtonElement>(null)
  const idRef = useRef(0)

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) return
    const rect = btnRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = idRef.current++
    setRipples(prev => [...prev, { x, y, id }])
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 800)
    onClick()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.3 }}
      className="relative"
    >
      <motion.div
        className="absolute inset-0 rounded-2xl blur-xl"
        style={{
          background: "linear-gradient(135deg, #ff0066, #9b2eff)",
          opacity: 0.5,
        }}
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <button
        ref={btnRef}
        onClick={handleClick}
        disabled={disabled}
        className="relative overflow-hidden px-10 py-4 rounded-2xl text-white font-bold text-lg tracking-wide
          bg-gradient-to-r from-neon-pink to-neon-purple
          shadow-lg shadow-neon-pink/30
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-neon-pink/50"
        style={{ transformStyle: "preserve-3d" }}
      >
        <motion.span
          className="relative z-10 flex items-center gap-3"
          animate={!disabled ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {label}
        </motion.span>

        {ripples.map(r => (
          <span
            key={r.id}
            className="absolute rounded-full bg-white/40 pointer-events-none"
            style={{
              left: r.x - 10,
              top: r.y - 10,
              width: 20,
              height: 20,
              animation: "ripple 0.8s ease-out forwards",
            }}
          />
        ))}
      </button>
      <style jsx>{`
        @keyframes ripple {
          0% { transform: scale(0); opacity: 0.6; }
          100% { transform: scale(20); opacity: 0; }
        }
      `}</style>
    </motion.div>
  )
}
