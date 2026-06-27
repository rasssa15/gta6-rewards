"use client"
import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRewardAnimation } from "./RewardAnimationContext"
import RewardBox from "./RewardBox"
import CardFlip from "./CardFlip"
import ClaimButton from "./ClaimButton"
import { GlowEffect } from "./GlowEffect"

export default function SingleReward() {
  const { currentReward, state, setState, close, callbacks } = useRewardAnimation()
  const [boxState, setBoxState] = useState<"idle" | "charged" | "open">("idle")
  const [flipped, setFlipped] = useState(false)
  const [showCard, setShowCard] = useState(false)
  const [claimed, setClaimed] = useState(false)

  if (!currentReward) return null

  const rarity = currentReward.rarity

  const handleBoxClick = useCallback(() => {
    if (boxState === "idle") {
      setBoxState("charged")
      setState("waitingClick")
    } else if (boxState === "charged") {
      setBoxState("open")
      callbacks.current.onBoxOpen?.()
      setTimeout(() => {
        setShowCard(true)
        setState("flip")
      }, 600)
    }
  }, [boxState, setState, callbacks])

  const handleTapToReveal = useCallback(() => {
    setFlipped(true)
    setState("revealed")
    callbacks.current.onCardFlip?.(currentReward)
    callbacks.current.onRewardReveal?.(currentReward)
  }, [currentReward, setState, callbacks])

  const handleClaim = useCallback(() => {
    setClaimed(true)
    setState("claim")
    callbacks.current.onClaim?.(currentReward)
    setTimeout(() => {
      setState("completed")
      close()
    }, 800)
  }, [currentReward, setState, callbacks, close])

  return (
    <div className="flex flex-col items-center justify-center min-h-full gap-6 px-4">
      {/* Pre-charge glow */}
      {boxState === "charged" && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <GlowEffect color="#ff0066" size={400} intensity={0.08} className="top-1/2 left-1/2" />
          <GlowEffect color="#00ccff" size={300} intensity={0.05} className="top-[40%] left-[60%]" />
        </motion.div>
      )}

      {/* Box phase */}
      {!showCard && (
        <motion.div
          key="box"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <RewardBox
            rarity={rarity}
            onClick={handleBoxClick}
            state={boxState}
          />
        </motion.div>
      )}

      {/* Card reveal phase */}
      <AnimatePresence>
        {showCard && (
          <motion.div
            key="card"
            className="flex flex-col items-center gap-6"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 150, damping: 15 }}
          >
            <div className="w-48 sm:w-56" onClick={!flipped ? handleTapToReveal : undefined}>
              <CardFlip
                reward={currentReward}
                flipped={flipped}
                onFlipComplete={() => {}}
              />
            </div>

            {!flipped && (
              <motion.p
                className="text-gray-500 text-sm tracking-widest uppercase"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Tap Card to Reveal
              </motion.p>
            )}

            {flipped && (
              <motion.div
                key="claim"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <ClaimButton onClick={handleClaim} disabled={claimed} />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
