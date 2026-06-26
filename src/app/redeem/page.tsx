"use client"
import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Gift, ArrowLeft, Check, AlertCircle, Loader2, Copy } from "lucide-react"
import { motion } from "framer-motion"
import { useWallet } from "@/components/providers/WalletProvider"
import toast from "react-hot-toast"

function RedeemContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { walletId, points, refresh } = useWallet()
  const [reward, setReward] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [redeeming, setRedeeming] = useState(false)
  const [success, setSuccess] = useState(false)
  const [couponCode, setCouponCode] = useState<string | null>(null)

  const rewardId = searchParams.get("reward")

  useEffect(() => {
    if (!rewardId) { setLoading(false); return }
    fetch(`/api/rewards`)
      .then(r => r.json())
      .then((rewards) => {
        const found = rewards.find((r: any) => r.id === rewardId)
        setReward(found)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [rewardId])

  const handleRedeem = async () => {
    if (!walletId) return toast.error("Connect your wallet first")
    if (!reward) return
    setRedeeming(true)
    try {
      const res = await fetch("/api/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletId, rewardId: reward.id }),
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess(true)
        if (data.couponCode) setCouponCode(data.couponCode)
        toast.success("Redemption successful!")
        refresh()
      } else {
        toast.error(data.error || "Redemption failed")
      }
    } catch {
      toast.error("Redemption failed")
    }
    setRedeeming(false)
  }

  const copyCode = () => {
    if (couponCode) {
      navigator.clipboard.writeText(couponCode)
      toast.success("Code copied!")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-neon-blue animate-spin" />
      </div>
    )
  }

  if (!rewardId || !reward) {
    return (
      <div className="min-h-screen pt-24 pb-16 text-center">
        <Gift className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h1 className="text-2xl text-gray-400 font-semibold mb-2">Reward not found</h1>
        <button onClick={() => router.push("/rewards")} className="text-neon-blue hover:underline">
          Browse rewards
        </button>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card p-10 text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-2xl bg-neon-green/20 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-neon-green" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-white mb-2">Redemption Successful!</h2>
          <p className="text-gray-400 mb-2">{reward.name}</p>

          {couponCode ? (
            <div className="mt-4 p-4 rounded-xl bg-neon-green/10 border border-neon-green/30">
              <p className="text-xs text-gray-400 mb-2">Your Coupon Code</p>
              <div className="flex items-center gap-2 justify-center">
                <code className="text-xl font-mono font-bold text-neon-green tracking-wider select-all">
                  {couponCode}
                </code>
                <button onClick={copyCode} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-neon-green transition-colors">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 mb-6">Your reward will be processed soon.</p>
          )}

          <button onClick={() => router.push("/dashboard")} className="btn-primary mt-6">
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="page-container max-w-md">
        <button onClick={() => router.push("/rewards")} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Rewards
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-neon-green/20 to-neon-blue/20 flex items-center justify-center mx-auto mb-6">
            <Gift className="w-10 h-10 text-neon-green" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-white mb-2">{reward.name}</h1>
          <p className="text-gray-400 mb-6">{reward.description}</p>

          {!walletId ? (
            <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-3 mb-6">
              <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0" />
              <p className="text-sm text-yellow-500">Connect your wallet to redeem rewards.</p>
            </div>
          ) : reward.stock < 1 ? (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 mb-6">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-sm text-red-500 font-semibold">Sold Out — This reward is no longer available.</p>
            </div>
          ) : points < reward.pointsCost ? (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 mb-6">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-sm text-red-500">
                You need {reward.pointsCost - points} more points.
              </p>
            </div>
          ) : null}

          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-heading font-bold text-neon-yellow">{reward.pointsCost}</div>
              <div className="text-xs text-gray-500">Points Required</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-heading font-bold text-neon-green">{reward.stock}</div>
              <div className="text-xs text-gray-500">Available</div>
            </div>
          </div>

          <button
            onClick={handleRedeem}
            disabled={!walletId || reward.stock < 1 || points < reward.pointsCost || redeeming}
            className="btn-primary w-full py-4 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {redeeming ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Gift className="w-5 h-5" />
                Redeem Now
              </>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  )
}

export default function RedeemPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 flex items-center justify-center"><div className="animate-pulse text-gray-400">Loading...</div></div>}>
      <RedeemContent />
    </Suspense>
  )
}
