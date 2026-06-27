"use client"
import { RewardAnimationProvider } from "@/components/rewards/RewardAnimationContext"
import RewardsAnimation from "@/components/rewards/RewardsAnimation"
import type { ReactNode } from "react"

export default function AnimationWrapper({ children }: { children: ReactNode }) {
  return (
    <RewardAnimationProvider>
      {children}
      <RewardsAnimation />
    </RewardAnimationProvider>
  )
}
