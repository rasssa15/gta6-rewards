"use client"
import { motion } from "framer-motion"
import { GlowEffect, LightRays } from "./GlowEffect"
import { getRarityColor, type Rarity } from "./RewardAnimationContext"

interface RewardBoxProps {
  rarity: Rarity
  onClick: () => void
  state: "idle" | "charged" | "open"
}

export default function RewardBox({ rarity, onClick, state }: RewardBoxProps) {
  const color = getRarityColor(rarity)

  return (
    <motion.div
      className="relative cursor-pointer"
      onClick={state !== "open" ? onClick : undefined}
      initial={{ opacity: 0, scale: 0.3, y: 60 }}
      animate={
        state === "open"
          ? { opacity: 0, scale: 1.5, y: -80 }
          : state === "charged"
            ? { opacity: 1, scale: 1.05, y: 0 }
            : { opacity: 1, scale: 1, y: 0 }
      }
      transition={{ type: "spring", stiffness: 200, damping: 20, mass: 1.2 }}
    >
      <GlowEffect color={color} size={220} intensity={0.15} className="top-1/2 left-1/2" />

      {state === "charged" && <LightRays className="opacity-40" />}

      {/* Box body */}
      <motion.div
        className="relative w-28 h-28 sm:w-36 sm:h-36"
        animate={
          state === "charged"
            ? { y: [0, -6, 0] }
            : { y: [0, -4, 0] }
        }
        transition={{ duration: state === "charged" ? 0.4 : 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Box shadow */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-20 h-4 rounded-full bg-black/40 blur-lg" />

        {/* Box */}
        <div className="relative w-full h-full">
          {/* Lid */}
          <motion.div
            className="absolute -top-1 left-0 right-0 h-[40%] rounded-t-xl origin-bottom"
            style={{
              background: `linear-gradient(160deg, ${color}88, ${color}44)`,
              border: `2px solid ${color}88`,
              boxShadow: `0 0 30px ${color}33`,
            }}
            animate={
              state === "open"
                ? { rotateX: -120, y: -10 }
                : { rotateX: 0, y: 0 }
            }
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <div className="absolute inset-1 rounded-t-lg bg-black/20" />
          </motion.div>

          {/* Base */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[65%] rounded-b-xl"
            style={{
              background: `linear-gradient(160deg, ${color}66, ${color}22)`,
              border: `2px solid ${color}66`,
              boxShadow: `0 0 20px ${color}22, inset 0 0 40px ${color}11`,
            }}
          >
            <div className="absolute inset-2 rounded-b-lg bg-black/20" />
            {/* Lock icon on base */}
            {state !== "open" && (
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-md"
                style={{
                  background: `linear-gradient(135deg, ${color}, ${color}88)`,
                  boxShadow: `0 0 15px ${color}`,
                }}
                animate={state === "charged" ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <div className="absolute inset-1 rounded-sm bg-black/30" />
              </motion.div>
            )}
          </div>

          {/* Glow lines */}
          <div className="absolute inset-0 rounded-xl"
            style={{ background: `linear-gradient(135deg, transparent 30%, ${color}11 50%, transparent 70%)` }}
          />
        </div>
      </motion.div>

      {state === "idle" && (
        <p className="text-center text-gray-500 text-xs mt-4 font-semibold tracking-wider">
          Tap Box
        </p>
      )}
    </motion.div>
  )
}
