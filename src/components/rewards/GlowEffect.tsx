"use client"
import { motion } from "framer-motion"

interface GlowEffectProps {
  color?: string
  size?: number
  intensity?: number
  className?: string
}

export function GlowEffect({ color = "#ff0066", size = 300, intensity = 0.3, className = "" }: GlowEffectProps) {
  return (
    <div
      className={`absolute pointer-events-none ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color}${Math.round(intensity * 100)} 0%, transparent 70%)`,
        filter: "blur(40px)",
        transform: "translate(-50%, -50%)",
      }}
      aria-hidden="true"
    />
  )
}

export function LightRays({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`} aria-hidden="true">
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * 360
        return (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2 origin-center"
            style={{
              width: 2,
              height: "60%",
              background: `linear-gradient(to top, transparent, rgba(255, 0, 102, 0.06), transparent)`,
              rotate: `${angle}deg`,
              transform: "translateX(-50%)",
            }}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
          />
        )
      })}
    </div>
  )
}
