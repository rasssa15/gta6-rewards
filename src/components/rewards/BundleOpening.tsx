"use client"
import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRewardAnimation, getRarityColor, type RewardItem } from "./RewardAnimationContext"
import CardFlip from "./CardFlip"
import ClaimButton from "./ClaimButton"
import { GlowEffect } from "./GlowEffect"

export default function BundleOpening() {
  const { bundleRewards, close, callbacks } = useRewardAnimation()
  const [phase, setPhase] = useState<"crate" | "fan" | "revealing" | "summary" | "completed">("crate")
  const [revealed, setRevealed] = useState<Set<number>>(new Set())
  const [currentRevealIndex, setCurrentRevealIndex] = useState(0)

  const handleCrateClick = useCallback(() => {
    setPhase("fan")
    callbacks.current.onBundleOpen?.()
    callbacks.current.onBoxOpen?.()
  }, [callbacks])

  const handleCardReveal = useCallback((index: number) => {
    setRevealed(prev => new Set([...prev, index]))
    setCurrentRevealIndex(index)
    callbacks.current.onCardFlip?.(bundleRewards[index])
    callbacks.current.onRewardReveal?.(bundleRewards[index])
  }, [bundleRewards, callbacks])

  const nextCard = useCallback(() => {
    const next = currentRevealIndex + 1
    if (next >= bundleRewards.length) {
      setPhase("summary")
    } else {
      setCurrentRevealIndex(next)
    }
  }, [currentRevealIndex, bundleRewards.length])

  const handleClaim = useCallback(() => {
    bundleRewards.forEach(r => callbacks.current.onClaim?.(r))
    setPhase("completed")
    close()
  }, [bundleRewards, callbacks, close])

  const crateColor = getRarityColor("legendary")

  return (
    <AnimatePresence mode="wait">
      {phase === "crate" && (
        <motion.div
          key="crate"
          className="flex flex-col items-center gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <motion.h2
            className="text-white text-2xl font-bold tracking-wider"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Premium Bundle
          </motion.h2>

          <motion.div
            className="relative cursor-pointer"
            onClick={handleCrateClick}
            initial={{ y: -200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 150, damping: 15 }}
          >
            <GlowEffect color={crateColor} size={300} intensity={0.2} className="top-1/2 left-1/2" />

            <motion.div
              className="w-40 h-40 sm:w-48 sm:h-48 relative"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Crate shadow */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-28 h-5 rounded-full bg-black/40 blur-md" />

              {/* Crate lid */}
              <motion.div
                className="absolute -top-1 left-[-4px] right-[-4px] h-[35%] rounded-t-lg origin-bottom"
                style={{
                  background: "linear-gradient(160deg, #ff0066, #9b2eff)",
                  border: "2px solid rgba(255,0,102,0.6)",
                  boxShadow: "0 0 30px rgba(255,0,102,0.3)",
                }}
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 0.3, repeat: Infinity }}
              >
                <div className="absolute inset-1 rounded-t-lg bg-black/20" />
              </motion.div>

              {/* Crate body */}
              <div
                className="absolute bottom-0 left-[-4px] right-[-4px] h-[70%] rounded-b-lg"
                style={{
                  background: "linear-gradient(160deg, #2c1a4e, #1a0533)",
                  border: "2px solid rgba(255,0,102,0.4)",
                  boxShadow: "inset 0 0 40px rgba(155,46,255,0.15)",
                }}
              >
                {/* Energy lines */}
                <div className="absolute inset-3 rounded-lg border border-neon-pink/20" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-6 rounded-full"
                      style={{ background: `linear-gradient(to top, ${crateColor}, transparent)` }}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>

          <p className="text-gray-400 text-sm tracking-wider">Tap the crate to open</p>
        </motion.div>
      )}

      {phase === "fan" && (
        <motion.div
          key="fan"
          className="flex flex-col items-center gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.h3 className="text-neon-pink text-lg font-bold" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            Select a Card
          </motion.h3>

          <div className="flex items-center justify-center gap-2 sm:gap-4">
            {bundleRewards.slice(0, 5).map((reward, i) => {
              const angle = (i - (bundleRewards.length - 1) / 2) * 8
              const isCurrent = i === currentRevealIndex && !revealed.has(i)
              return (
                <motion.div
                  key={reward.id}
                  className="relative"
                  initial={{ opacity: 0, y: 100, rotate: angle }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    rotate: angle,
                    scale: isCurrent ? 1.1 : 0.9,
                  }}
                  transition={{ type: "spring", stiffness: 200, damping: 20, delay: i * 0.12 }}
                  style={{ zIndex: isCurrent ? 10 : 1 }}
                >
                  <div className="w-20 sm:w-28" onClick={() => !revealed.has(i) && handleCardReveal(i)}>
                    <CardFlip
                      reward={reward}
                      flipped={revealed.has(i)}
                      onFlipComplete={() => {}}
                    />
                  </div>
                  {revealed.has(i) && (
                    <motion.div
                      className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold whitespace-nowrap"
                      style={{ color: getRarityColor(reward.rarity) }}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      +{reward.points} pts
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* Continue button after revealing a card */}
          {revealed.size > 0 && revealed.size <= bundleRewards.length && (
            <motion.button
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-neon-pink to-neon-purple text-white font-bold text-sm
                shadow-lg shadow-neon-pink/20"
              onClick={nextCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {revealed.size >= bundleRewards.length ? "View Summary" : "Next Card"}
            </motion.button>
          )}
        </motion.div>
      )}

      {phase === "summary" && (
        <motion.div
          key="summary"
          className="flex flex-col items-center gap-6 max-w-sm w-full px-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-yellow/30 to-neon-green/20 flex items-center justify-center border border-neon-yellow/30"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <svg className="w-8 h-8 text-neon-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>

          <h2 className="text-white text-2xl font-bold">Bundle Complete!</h2>

          <div className="w-full glass-card p-5 space-y-3">
            {bundleRewards.map((r, i) => (
              <motion.div
                key={r.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{
                      background: `linear-gradient(135deg, ${getRarityColor(r.rarity)}44, transparent)`,
                      border: `1px solid ${getRarityColor(r.rarity)}44`,
                      color: getRarityColor(r.rarity),
                    }}
                  >
                    {r.rarity[0].toUpperCase()}
                  </div>
                  <span className="text-white text-sm">{r.name}</span>
                </div>
                <span className="text-neon-yellow font-mono font-bold text-sm">+{r.points}</span>
              </motion.div>
            ))}

            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-neon-yellow/10 to-transparent border border-neon-yellow/20">
              <span className="text-white font-bold">Total Earned</span>
              <span className="text-neon-yellow font-mono font-bold text-lg">
                +{bundleRewards.reduce((s, r) => s + r.points, 0)}
              </span>
            </div>
          </div>

          <ClaimButton onClick={handleClaim} label="Collect All" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
