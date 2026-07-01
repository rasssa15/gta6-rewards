"use client"
import {
  RewardAnimationProvider,
  useRewardAnimation,
  RewardsAnimation,
  type RewardItem,
} from "@/components/rewards"

const DEMO_SINGLE: RewardItem = {
  id: "demo-1",
  name: "Vice City Nights",
  description: "Exclusive GTA VI neon city wallpaper",
  rarity: "epic",
  points: 500,
  type: "points",
}

const DEMO_BUNDLE: RewardItem[] = [
  { id: "b1", name: "Bronze Coin", description: "Standard reward", rarity: "common", points: 10, type: "card" },
  { id: "b2", name: "Silver Bar", description: "Uncommon prize", rarity: "uncommon", points: 25, type: "card" },
  { id: "b3", name: "Gold Star", description: "Rare find", rarity: "rare", points: 50, type: "card" },
  { id: "b4", name: "Neon Skin", description: "Epic custom skin", rarity: "epic", points: 100, type: "card" },
  { id: "b5", name: "GTA VI Pre-Order", description: "Legendary grand prize", rarity: "legendary", points: 500, type: "card" },
]

const RARITIES: RewardItem["rarity"][] = ["common", "uncommon", "rare", "epic", "legendary"]

function DemoControls() {
  const { openSingleReward, openBundle } = useRewardAnimation()

  const randomReward = (): RewardItem => {
    const rar = RARITIES[Math.floor(Math.random() * RARITIES.length)]
    const pts = rar === "common" ? Math.floor(Math.random() * 3) + 1
      : rar === "uncommon" ? Math.floor(Math.random() * 4) + 2
      : rar === "rare" ? Math.floor(Math.random() * 6) + 5
      : rar === "epic" ? Math.floor(Math.random() * 11) + 10
      : Math.floor(Math.random() * 6) + 5
    return {
      id: crypto.randomUUID(),
      name: [`Neon Streak`, `Vice Point`, `Ocean View`, `Sunset Strip`, `Starfish Island`][Math.floor(Math.random() * 5)],
      description: `GTA VI themed reward • ${rar} quality`,
      rarity: rar,
      points: pts,
      type: "points",
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="page-container max-w-lg">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-heading font-bold text-white mb-3">
            Reward Animation <span className="bg-gradient-to-r from-neon-pink to-neon-blue bg-clip-text text-transparent">Demo</span>
          </h1>
          <p className="text-gray-400">Test single card and bundle opening animations</p>
        </div>

        <div className="glass-card p-8 space-y-6">
          <div>
            <h2 className="text-white font-bold mb-3">Single Reward</h2>
            <div className="grid grid-cols-2 gap-3">
              {RARITIES.map(r => (
                <button
                  key={r}
                  onClick={() => openSingleReward({ ...randomReward(), rarity: r })}
                  className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-left"
                >
                  <div className="text-xs text-gray-400 uppercase tracking-wider">{r}</div>
                  <div className="text-white font-semibold">Random {r} pts</div>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-white/5 pt-6">
            <h2 className="text-white font-bold mb-3">Bundle Opening</h2>
            <button
              onClick={() => openBundle(DEMO_BUNDLE)}
              className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-neon-pink to-neon-purple text-white font-bold text-lg shadow-lg shadow-neon-pink/20 hover:shadow-xl hover:shadow-neon-pink/30"
            >
              Open Premium Bundle (5 Cards)
            </button>
          </div>

          <div className="border-t border-white/5 pt-6">
            <h2 className="text-white font-bold mb-3">Quick Test — Low Points</h2>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4, 5, 10, 15, 20].map(pts => (
                <button
                  key={pts}
                  onClick={() => openSingleReward({
                    id: crypto.randomUUID(),
                    name: `${pts} Points`,
                    description: `You earned ${pts} points!`,
                    rarity: pts <= 3 ? "common" : pts <= 5 ? "uncommon" : pts <= 10 ? "rare" : "epic",
                    points: pts,
                    type: "points",
                  })}
                  className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white font-mono"
                >
                  +{pts}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AnimationDemoPage() {
  return (
    <RewardAnimationProvider>
      <DemoControls />
      <RewardsAnimation />
    </RewardAnimationProvider>
  )
}
