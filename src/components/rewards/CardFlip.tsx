"use client"
import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { getRarityColor, getRarityGradient, type RewardItem } from "./RewardAnimationContext"

interface CardFlipProps {
  reward: RewardItem
  flipped: boolean
  onFlipComplete?: () => void
  className?: string
}

export default function CardFlip({ reward, flipped, onFlipComplete, className = "" }: CardFlipProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current || flipped) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setMousePos({ x: x * 20, y: y * -20 })
  }

  const rarityColor = getRarityColor(reward.rarity)
  const rarityGradient = getRarityGradient(reward.rarity)

  return (
    <motion.div
      ref={cardRef}
      className={`perspective-[1200px] cursor-pointer ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setMousePos({ x: 0, y: 0 }) }}
      onClick={onFlipComplete}
      initial={{ opacity: 0, scale: 0.5, y: 40 }}
      animate={
        flipped
          ? { opacity: 1, scale: 1, y: 0, rotateY: 180 }
          : {
              opacity: 1,
              scale: isHovered ? 1.03 : 1,
              y: 0,
              rotateX: mousePos.y,
              rotateY: mousePos.x,
            }
      }
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25,
        mass: 0.8,
      }}
    >
      <div
        className="relative w-full aspect-[3/4] rounded-2xl"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Back */}
        <motion.div
          className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-3 overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            background: "linear-gradient(135deg, #1a0533, #0d0218)",
            border: `2px solid ${rarityColor}44`,
            boxShadow: `0 0 30px ${rarityColor}22, inset 0 0 60px ${rarityColor}11`,
          }}
          animate={!flipped ? { boxShadow: [`0 0 30px ${rarityColor}22`, `0 0 50px ${rarityColor}44`, `0 0 30px ${rarityColor}22`] } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-pink/30 to-neon-purple/20 flex items-center justify-center border border-neon-pink/30"
            style={{ boxShadow: `0 0 20px ${rarityColor}33` }}>
            <svg className="w-8 h-8 text-neon-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-xs text-gray-500 font-semibold tracking-widest uppercase">Tap to Reveal</p>

          <div className="absolute inset-0 rounded-2xl" style={{
            background: `linear-gradient(135deg, transparent 40%, ${rarityColor}11 50%, transparent 60%)`,
          }} />
        </motion.div>

        {/* Front */}
        <motion.div
          className="absolute inset-0 rounded-2xl p-5 flex flex-col overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            rotateY: 180,
            background: "linear-gradient(160deg, #1a0533, #0d0218)",
            border: `2px solid ${rarityColor}66`,
            boxShadow: `0 0 40px ${rarityColor}33, inset 0 0 80px ${rarityColor}11`,
          }}
        >
          {/* Rarity badge */}
          <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full bg-gradient-to-r ${rarityGradient} text-[9px] font-bold text-white uppercase tracking-wider shadow-lg`}>
            {reward.rarity}
          </div>

          {/* Card image area */}
          <div className="flex-1 flex items-center justify-center">
            {reward.image ? (
              <img src={reward.image} alt={reward.name} className="w-full h-full object-contain" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-neon-pink/20 to-neon-blue/10 flex items-center justify-center border border-white/10"
                style={{ boxShadow: `0 0 30px ${rarityColor}33` }}>
                <span className="text-3xl">🎁</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="text-center mt-auto">
            <h3 className="text-white font-bold text-sm leading-tight">{reward.name}</h3>
            <p className="text-gray-400 text-[10px] mt-1 line-clamp-2">{reward.description}</p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5">
              <span className="text-neon-yellow font-mono font-bold text-xs">+{reward.points}</span>
              <span className="text-gray-500 text-[10px]">pts</span>
            </div>
          </div>

          {/* Glass reflection */}
          <div className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.03) 100%)",
            }} />
        </motion.div>
      </div>
    </motion.div>
  )
}
