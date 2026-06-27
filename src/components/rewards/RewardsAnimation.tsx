"use client"
import { useRewardAnimation } from "./RewardAnimationContext"
import RewardOverlay from "./RewardOverlay"
import SingleReward from "./SingleReward"
import BundleOpening from "./BundleOpening"

export default function RewardsAnimation() {
  const { isOpen, bundleRewards } = useRewardAnimation()

  if (!isOpen) return null

  return (
    <RewardOverlay>
      {bundleRewards.length > 0 ? <BundleOpening /> : <SingleReward />}
    </RewardOverlay>
  )
}
