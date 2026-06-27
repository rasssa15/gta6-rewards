"use client"
import { useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRewardAnimation } from "./RewardAnimationContext"
import ParticleBackground from "./ParticleBackground"

interface RewardOverlayProps {
  children: React.ReactNode
}

export default function RewardOverlay({ children }: RewardOverlayProps) {
  const { isOpen, close, state } = useRewardAnimation()

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && (state === "completed" || state === "idle")) close()
    },
    [close, state]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [isOpen, handleKeyDown])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          role="dialog"
          aria-modal="true"
          aria-label="Reward animation"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (state === "completed") close()
            }}
          />

          {/* Particles */}
          <ParticleBackground intensity={1.5} />

          {/* Content */}
          <motion.div
            className="relative z-10 w-full h-full flex items-center justify-center"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
          >
            <div
              className="focus:outline-none"
              tabIndex={-1}
              role="document"
              onKeyDown={(e) => e.stopPropagation()}
            >
              {children}
            </div>
          </motion.div>

          {/* Close button (bottom right, only when completed) */}
          {state === "completed" && (
            <motion.button
              className="absolute bottom-8 right-8 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20"
              onClick={close}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.5 }}
              aria-label="Close reward modal"
            >
              Close (ESC)
            </motion.button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
