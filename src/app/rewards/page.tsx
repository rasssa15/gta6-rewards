"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Gift, Zap, Play, Sparkles, CheckCircle, Clock, ChevronRight } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

const categories = ["All", "steam", "playstation", "xbox", "premium", "digital", "custom"]

export default function RewardsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [rewards, setRewards] = useState<any[]>([])
  const [redemptions, setRedemptions] = useState<any[]>([])
  const [activeCategory, setActiveCategory] = useState("All")
  const [userPoints, setUserPoints] = useState(0)
  const [showScratch, setShowScratch] = useState(false)
  const [scratchCards, setScratchCards] = useState<any[]>([])
  const [adWatching, setAdWatching] = useState(false)
  const [adCountdown, setAdCountdown] = useState(0)

  useEffect(() => {
    fetch("/api/rewards").then(r => r.json()).then(d => { if (d.data) setRewards(d.data) }).catch(() => {})
    if (session) {
      fetch("/api/auth/me").then(r => r.json()).then(d => {
        if (d.data) { setUserPoints(d.data.points); setScratchCards(d.data.scratchCards || []) }
      }).catch(() => {})
      fetch("/api/rewards/redeem").then(r => r.json()).then(d => { if (d.data) setRedemptions(d.data) }).catch(() => {})
    }
  }, [session])

  const filteredRewards = activeCategory === "All"
    ? rewards
    : rewards.filter((r) => r.type === activeCategory)

  const handleRedeem = async (rewardId: string) => {
    if (!session) { router.push("/auth/login"); return }
    try {
      const res = await fetch("/api/rewards/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardId }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Reward redeemed! Check your history.")
        setUserPoints((p) => p - data.data.pointsCost)
        fetch("/api/rewards/redeem").then(r => r.json()).then(d => { if (d.data) setRedemptions(d.data) })
      } else {
        toast.error(data.error || "Failed to redeem")
      }
    } catch { toast.error("Something went wrong") }
  }

  const handleWatchAd = async () => {
    if (!session) { router.push("/auth/login"); return }
    setAdWatching(true)
    setAdCountdown(5)

    const interval = setInterval(() => {
      setAdCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    setTimeout(async () => {
      setAdWatching(false)
      try {
        const res = await fetch("/api/ads/watch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed: true }),
        })
        const data = await res.json()
        if (data.success) {
          toast.success(`+${data.data.pointsEarned} points! Scratch card awarded!`)
          setUserPoints((p) => p + data.data.pointsEarned)
          setScratchCards((prev) => [...prev, { id: data.data.scratchCardId, reward: 0, status: "unused" }])
          fetch("/api/scratch-cards").then(r => r.json()).then(d => { if (d.data) setScratchCards(d.data) })
        }
      } catch { toast.error("Ad reward failed") }
    }, 5000)
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="page-container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-2">Rewards Center</h1>
              <p className="text-gray-400">Redeem your points for exclusive gaming rewards</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="glass-card px-4 py-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-neon-yellow" />
                <span className="text-lg font-heading font-bold text-neon-yellow">{userPoints.toLocaleString()}</span>
                <span className="text-sm text-gray-400">points</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Ad Watch / Scratch Card Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
            <div className="glass-card p-6">
              <h3 className="text-lg font-heading font-bold text-white mb-2 flex items-center gap-2">
                <Play className="w-5 h-5 text-neon-pink" />
                Watch Rewarded Ads
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Watch a short ad to earn <span className="text-neon-yellow font-bold">2 points</span> and receive a <span className="text-neon-purple font-bold">scratch card</span>!
              </p>
              <button
                onClick={handleWatchAd}
                disabled={adWatching}
                className={`btn-primary flex items-center gap-2 ${adWatching ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {adWatching ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    Watching... {adCountdown}s
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Watch Ad
                  </>
                )}
              </button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="glass-card p-6 text-center">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-neon-purple" />
              <h3 className="text-lg font-heading font-bold text-white mb-1">Scratch Cards</h3>
              <p className="text-3xl font-heading font-bold text-neon-yellow mb-1">{scratchCards.length}</p>
              <p className="text-xs text-gray-400">Available to open</p>
            </div>
          </motion.div>
        </div>

        {/* Rewards Grid */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                activeCategory === cat
                  ? "bg-gradient-to-r from-neon-pink to-neon-purple text-white"
                  : "glass text-gray-300 hover:text-white"
              }`}
            >
              {cat === "All" ? "All Rewards" : cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRewards.map((reward, i) => (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-6 flex flex-col"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center mb-4">
                <Gift className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-heading font-bold text-white mb-2">{reward.name}</h3>
              <p className="text-sm text-gray-400 mb-4 flex-1">{reward.description}</p>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1 text-neon-yellow font-bold">
                  <Zap className="w-4 h-4" />
                  <span>{reward.cost.toLocaleString()} pts</span>
                </div>
                <span className="text-xs text-gray-500">{reward.stock > 0 ? `${reward.stock} left` : "Out of stock"}</span>
              </div>
              <button
                onClick={() => handleRedeem(reward.id)}
                disabled={!session || userPoints < reward.cost || reward.stock <= 0}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  !session || userPoints < reward.cost || reward.stock <= 0
                    ? "bg-white/5 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-neon-pink to-neon-purple text-white hover:shadow-lg"
                }`}
              >
                {!session ? "Sign In to Redeem" : userPoints < reward.cost ? "Not Enough Points" : reward.stock <= 0 ? "Out of Stock" : "Redeem"}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Redemption History */}
        {redemptions.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-heading font-bold text-white mb-6">Redemption History</h3>
            <div className="glass-card divide-y divide-white/5">
              {redemptions.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      r.status === "completed" ? "bg-neon-green/10" : r.status === "pending" ? "bg-neon-yellow/10" : "bg-red-500/10"
                    }`}>
                      {r.status === "completed" ? <CheckCircle className="w-4 h-4 text-neon-green" /> :
                       r.status === "pending" ? <Clock className="w-4 h-4 text-neon-yellow" /> :
                       <span className="text-red-400 text-sm">!</span>}
                    </div>
                    <div>
                      <p className="text-sm text-white">{r.reward?.name || "Reward"}</p>
                      <p className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-bold ${
                      r.status === "completed" ? "text-neon-green" : r.status === "pending" ? "text-neon-yellow" : "text-red-400"
                    }`}>
                      -{r.pointsCost} pts
                    </span>
                    <p className="text-xs text-gray-500 capitalize">{r.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
