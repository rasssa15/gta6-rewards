"use client"
import { useState, useEffect } from "react"
import { Gift, ArrowRight, Star, Monitor, Gamepad2, Globe, ShoppingBag, Radio, Zap, Shield, Image as ImageIcon } from "lucide-react"
import { formatNumber } from "@/lib/utils"
import Link from "next/link"
import { RedeemGuide } from "@/components/redeem/RedeemGuide"
import { AdBanner } from "@/components/ads/AdBanner"

const PLATFORMS = [
  { key: "all", label: "All Rewards", icon: Gift },
  { key: "steam", label: "Steam", icon: Monitor },
  { key: "epic", label: "Epic Games", icon: ShoppingBag },
  { key: "playstation", label: "PlayStation", icon: Radio },
  { key: "xbox", label: "Xbox", icon: Globe },
  { key: "nintendo", label: "Nintendo", icon: Gamepad2 },
  { key: "gta6", label: "GTA 6", icon: Star },
  { key: "giftcard", label: "Gift Cards", icon: Gift },
  { key: "wallpaper", label: "Wallpapers", icon: ImageIcon },
]

const FEATURED_CATEGORIES = ["gta6", "steam", "playstation"]

export default function RewardsPage() {
  const [rewards, setRewards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activePlatform, setActivePlatform] = useState("all")

  useEffect(() => {
    fetch("/api/rewards")
      .then(r => r.json())
      .then(setRewards)
      .catch(() => setRewards([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = activePlatform === "all"
    ? rewards
    : rewards.filter(r => {
        const cat = r.category || ""
        if (activePlatform === "gta6") return cat === "coupon-gta6"
        if (activePlatform === "giftcard") return cat.startsWith("coupon-giftcard") || cat === "gift-card"
        if (activePlatform === "wallpaper") return cat === "wallpaper-pack"
        return cat === `coupon-${activePlatform}`
      })

  const featured = rewards.filter(r => FEATURED_CATEGORIES.includes((r.category || "").replace("coupon-", "")))

  return (
    <div className="min-h-screen pt-24 pb-16">
      <section className="relative overflow-hidden mb-12">
        <div className="absolute inset-0 z-0">
          <img src="/images/hero-cityscape.png" alt="" className="w-full h-full object-cover object-center opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#070710]/80 via-[#070710]/50 to-[#070710]" />
        </div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-neon-purple/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/3 left-1/4 w-48 h-48 rounded-full bg-neon-green/10 blur-[80px] pointer-events-none" />
        <div className="page-container relative z-10 py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-green to-neon-blue flex items-center justify-center mx-auto mb-4 shadow-lg shadow-neon-green/20">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-heading font-bold text-white mb-3">
            Rewards <span className="bg-gradient-to-r from-neon-green to-neon-blue bg-clip-text text-transparent">Center</span>
          </h1>
          <p className="text-gray-300 max-w-lg mx-auto text-base">
            Redeem your points for game coupon codes, gift cards, and exclusive GTA 6 rewards
          </p>
          <div className="flex items-center justify-center gap-6 mt-6 text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <Shield className="w-4 h-4 text-neon-green" />
              Instant delivery
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Zap className="w-4 h-4 text-neon-yellow" />
              Limited stock
            </div>
          </div>
        </div>
      </section>

      <div className="page-container mb-10">
        <AdBanner adKey="rewards-leaderboard" height={90} width={728} className="flex justify-center mb-10" />
      </div>
      <div className="page-container">
        {activePlatform === "all" && featured.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-5">
              <Star className="w-5 h-5 text-neon-yellow" />
              <h2 className="text-lg font-heading font-bold text-white">Featured Rewards</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featured.slice(0, 3).map((reward) => {
                const cat = reward.category || ""
                const platformKey = cat.replace("coupon-", "")
                const platform = PLATFORMS.find(p => p.key === platformKey) || PLATFORMS[0]
                const Icon = platform.icon
                return (
                  <Link
                    key={reward.id}
                    href={`/redeem?reward=${reward.id}`}
                    className="glass-card overflow-hidden block"
                  >
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={reward.image}
                        alt={reward.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `/images/rewards/${platformKey}-coupon.svg`
                          ;(e.target as HTMLImageElement).onerror = null
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#070710] via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 text-xs text-neon-green font-semibold">
                        <Icon className="w-3 h-3" />
                        {platform.label}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-semibold">{reward.name}</h3>
                      <p className="text-gray-400 text-sm mt-1 line-clamp-2">{reward.description}</p>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                        <span className="flex items-center gap-1 text-neon-yellow font-mono font-bold text-sm">
                          <Star className="w-3.5 h-3.5" />
                          {reward.pointsCost} points
                        </span>
                        <span className="text-xs text-gray-500">{reward.stock} left</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {PLATFORMS.map(p => {
            const Icon = p.icon
            const isActive = activePlatform === p.key
            return (
              <button
                key={p.key}
                onClick={() => setActivePlatform(p.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium ${
                  isActive
                    ? "bg-neon-green/15 text-neon-green border border-neon-green/40 shadow-lg shadow-neon-green/10"
                    : "glass text-gray-400 hover:text-white border border-transparent"
                }`}
              >
                <Icon className="w-4 h-4" />
                {p.label}
              </button>
            )
          })}
        </div>

        <div className="flex justify-center mb-8">
          <AdBanner adKey="rewards-sidebar" height={300} width={160} className="flex justify-center" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card overflow-hidden">
                <div className="h-40 skeleton" />
                <div className="p-4 space-y-3">
                  <div className="h-5 w-3/4 skeleton" />
                  <div className="h-4 w-full skeleton" />
                  <div className="h-4 w-1/2 skeleton" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Gift className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-xl text-gray-400 font-semibold mb-1">No rewards available</h3>
            <p className="text-gray-600 text-sm">Check back soon for new rewards in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((reward) => {
              const cat = reward.category || ""
              const platformKey = cat.replace("coupon-", "")
              const platform = PLATFORMS.find(p => p.key === platformKey) || PLATFORMS[0]
              const Icon = platform.icon
              return (
                <div
                  key={reward.id}
                  className="glass-card overflow-hidden flex flex-col"
                >
                  <div className="relative h-36 overflow-hidden bg-white/5">
                    <img
                      src={reward.image}
                      alt={reward.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `/images/rewards/${platformKey}-coupon.svg`
                        ;(e.target as HTMLImageElement).onerror = null
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 text-[10px] text-neon-green font-semibold">
                      <Icon className="w-3 h-3" />
                      {platform.label}
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-white font-semibold mb-1">{reward.name}</h3>
                    <p className="text-gray-400 text-sm flex-1">{reward.description}</p>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                      <span className="flex items-center gap-1 text-neon-yellow font-mono font-bold">
                        <Star className="w-4 h-4" />
                        {reward.pointsCost}
                      </span>
                      <span className={`text-xs ${reward.stock > 0 ? "text-gray-500" : "text-red-400"}`}>
                        {reward.stock > 0 ? `${reward.stock} left` : "Out of stock"}
                      </span>
                    </div>
                    {reward.stock > 0 ? (
                      <Link
                        href={`/redeem?reward=${reward.id}`}
                        className="btn-primary w-full mt-4 text-sm !py-2.5 text-center flex items-center justify-center gap-2"
                      >
                        Redeem <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <div className="w-full mt-4 py-2.5 text-sm text-center rounded-xl bg-red-500/10 text-red-400 font-semibold cursor-not-allowed border border-red-500/20">
                        Sold Out
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="flex justify-center mb-8">
          <AdBanner adKey="rewards-bottom" height={60} width={468} className="flex justify-center" />
        </div>
        <RedeemGuide />
      </div>
    </div>
  )
}
