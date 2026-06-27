"use client"
import { createContext, useContext, useCallback, useState, useRef, type ReactNode } from "react"

export type AnimationState = "idle" | "opening" | "waitingClick" | "flip" | "revealed" | "claim" | "completed"

export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary"

export interface RewardItem {
  id: string
  name: string
  description: string
  image?: string
  rarity: Rarity
  points: number
  type: "points" | "card" | "bundle"
}

export interface AnimationCallbacks {
  onBoxAppear?: () => void
  onBoxOpen?: () => void
  onCardFlip?: (reward: RewardItem) => void
  onRewardReveal?: (reward: RewardItem) => void
  onClaim?: (reward: RewardItem) => void
  onBundleOpen?: () => void
  onComplete?: () => void
}

interface RewardAnimationContextType {
  state: AnimationState
  setState: (s: AnimationState) => void
  currentReward: RewardItem | null
  bundleRewards: RewardItem[]
  openSingleReward: (reward: RewardItem, callbacks?: AnimationCallbacks) => void
  openBundle: (rewards: RewardItem[], callbacks?: AnimationCallbacks) => void
  callbacks: React.MutableRefObject<AnimationCallbacks>
  close: () => void
  isOpen: boolean
}

const RewardAnimationContext = createContext<RewardAnimationContextType | null>(null)

const RARITY_COLORS: Record<Rarity, string> = {
  common: "#9ca3af",
  uncommon: "#22c55e",
  rare: "#3b82f6",
  epic: "#a855f7",
  legendary: "#f59e0b",
}

export function getRarityColor(rarity: Rarity): string {
  return RARITY_COLORS[rarity]
}

export function getRarityGradient(rarity: Rarity): string {
  const gradients: Record<Rarity, string> = {
    common: "from-gray-400 to-gray-500",
    uncommon: "from-green-400 to-emerald-500",
    rare: "from-blue-400 to-indigo-500",
    epic: "from-purple-400 to-pink-500",
    legendary: "from-yellow-400 to-amber-500",
  }
  return gradients[rarity]
}

export function useRewardAnimation() {
  const ctx = useContext(RewardAnimationContext)
  if (!ctx) throw new Error("useRewardAnimation must be used within RewardAnimationProvider")
  return ctx
}

export function RewardAnimationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AnimationState>("idle")
  const [currentReward, setCurrentReward] = useState<RewardItem | null>(null)
  const [bundleRewards, setBundleRewards] = useState<RewardItem[]>([])
  const callbacks = useRef<AnimationCallbacks>({})
  const [isOpen, setIsOpen] = useState(false)

  const openSingleReward = useCallback((reward: RewardItem, cb?: AnimationCallbacks) => {
    setCurrentReward(reward)
    setBundleRewards([])
    callbacks.current = cb || {}
    setIsOpen(true)
    setState("opening")
  }, [])

  const openBundle = useCallback((rewards: RewardItem[], cb?: AnimationCallbacks) => {
    setCurrentReward(null)
    setBundleRewards(rewards)
    callbacks.current = cb || {}
    setIsOpen(true)
    setState("opening")
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setState("idle")
    setCurrentReward(null)
    setBundleRewards([])
    callbacks.current.onComplete?.()
  }, [])

  return (
    <RewardAnimationContext.Provider
      value={{ state, setState, currentReward, bundleRewards, openSingleReward, openBundle, callbacks, close, isOpen }}
    >
      {children}
    </RewardAnimationContext.Provider>
  )
}
