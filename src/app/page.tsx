import { HeroSection } from "@/components/home/HeroSection"
import { FeaturedNews } from "@/components/home/FeaturedNews"
import { TrendingSection } from "@/components/home/TrendingSection"
import { RewardsCenter } from "@/components/home/RewardsCenter"
import { TopEarners } from "@/components/home/TopEarners"
import { DailyChallenges } from "@/components/home/DailyChallenges"

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedNews />
      <TrendingSection />
      <RewardsCenter />
      <TopEarners />
      <DailyChallenges />
    </>
  )
}
