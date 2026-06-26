"use client"
import { useState, useEffect } from "react"
import { Gift, ArrowRight, Check, Star, Monitor, Gamepad2, Globe, ShoppingBag, Radio, Trophy, Zap, Coins } from "lucide-react"
import { motion } from "framer-motion"
import { formatNumber } from "@/lib/utils"
import Link from "next/link"

const PLATFORMS = [
  { key: "all", label: "All", icon: Gift },
  { key: "steam", label: "Steam", icon: Monitor },
  { key: "epic", label: "Epic Games", icon: ShoppingBag },
  { key: "playstation", label: "PlayStation", icon: Radio },
  { key: "xbox", label: "Xbox", icon: Globe },
  { key: "nintendo", label: "Nintendo", icon: Gamepad2 },
  { key: "gta6", label: "GTA 6", icon: Star },
  { key: "bronze", label: "🥉 Bronze", icon: Coins },
  { key: "silver", label: "🥈 Silver", icon: Zap },
  { key: "gold", label: "🥇 Gold", icon: Trophy },
  { key: "giftcard", label: "Gift Cards", icon: Star },
]

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
        if (activePlatform === "giftcard") return cat.startsWith("coupon-giftcard")
        if (["bronze", "silver", "gold"].includes(activePlatform)) return cat === `coupon-${activePlatform}`
        return cat === `coupon-${activePlatform}`
      })

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="page-container">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-green to-neon-blue flex items-center justify-center mx-auto mb-4">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-white mb-2">Rewards Center</h1>
          <p className="text-gray-400">Redeem your points for game coupon codes</p>
        </div>

        {/* Platform Tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {PLATFORMS.map(p => {
            const Icon = p.icon
            const isActive = activePlatform === p.key
            return (
              <button
                key={p.key}
                onClick={() => setActivePlatform(p.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-neon-green/20 text-neon-green border border-neon-green/40"
                    : "glass text-gray-400 hover:text-white border border-transparent"
                }`}
              >
                <Icon className="w-4 h-4" />
                {p.label}
              </button>
            )
          })}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card p-6 space-y-4">
                <div className="h-12 w-12 rounded-xl skeleton" />
                <div className="h-5 w-3/4 skeleton" />
                <div className="h-4 w-full skeleton" />
                <div className="h-10 w-full skeleton" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Gift className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl text-gray-400 font-semibold">No rewards in this category</h3>
            <p className="text-gray-600 text-sm mt-2">Check back soon for new rewards.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((reward, i) => {
              const cat = reward.category || ""
              let platform = PLATFORMS.find(p => cat === `coupon-${p.key}` || (p.key === "gta6" && cat === "coupon-gta6"))
              if (!platform && ["bronze", "silver", "gold"].some(t => cat === `coupon-${t}`)) {
                platform = PLATFORMS.find(p => ["bronze", "silver", "gold"].includes(p.key))
              }
              platform ||= PLATFORMS[0]
              const Icon = platform.icon
              return (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="glass-card p-6 flex flex-col"
                >
                  {reward.image ? (
                    <div className="relative w-full h-36 rounded-xl overflow-hidden mb-4">
                      <img src={reward.image} alt={reward.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-green/20 to-neon-blue/20 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-neon-green" />
                    </div>
                  )}
                  <h3 className="text-white font-semibold mb-2">{reward.name}</h3>
                  <p className="text-gray-400 text-sm flex-1">{reward.description}</p>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-1 text-neon-yellow font-mono font-bold">
                      <Star className="w-4 h-4" />
                      {reward.pointsCost}
                    </div>
                    <span className="text-xs text-gray-500">
                      {reward.stock > 0 ? `${reward.stock} left` : "Out of stock"}
                    </span>
                  </div>
                  {reward.stock > 0 ? (
                    <Link
                      href={`/redeem?reward=${reward.id}`}
                      className="btn-primary w-full mt-4 text-sm !py-2.5 text-center"
                    >
                      Redeem
                    </Link>
                  ) : (
                    <div className="w-full mt-4 py-2.5 text-sm text-center rounded-xl bg-white/5 text-red-400 font-semibold cursor-not-allowed">
                      Sold Out
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
