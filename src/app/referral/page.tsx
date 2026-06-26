"use client"
import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Gift, Users, Copy, Check, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { useWallet } from "@/components/providers/WalletProvider"
import toast from "react-hot-toast"

function ReferralContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { walletId } = useWallet()
  const refCode = searchParams.get("ref")
  const [claiming, setClaiming] = useState(false)
  const [claimed, setClaimed] = useState(false)

  const handleClaim = async () => {
    if (!walletId) return toast.error("Connect your wallet first")
    if (!refCode) return
    setClaiming(true)
    try {
      const res = await fetch("/api/referral/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletId, code: refCode }),
      })
      const data = await res.json()
      if (res.ok) {
        setClaimed(true)
        toast.success(`Referred by ${data.referrerName}!`)
      } else {
        toast.error(data.error || "Invalid code")
      }
    } catch {
      toast.error("Failed to claim")
    }
    setClaiming(false)
  }

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-green to-neon-blue flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-white" />
        </div>
        {refCode ? (
          <>
            <h1 className="text-2xl font-heading font-bold text-white mb-2">Referral Code Detected!</h1>
            <p className="text-gray-400 text-sm mb-2">Code: <span className="text-neon-green font-mono font-bold">{refCode}</span></p>
            <p className="text-gray-500 text-xs mb-6">Your friend invited you! Claim their referral to earn bonuses on first redemption.</p>
            {claimed ? (
              <div className="p-4 rounded-xl bg-neon-green/10 border border-neon-green/20">
                <Check className="w-6 h-6 text-neon-green mx-auto mb-1" />
                <p className="text-neon-green font-semibold">Referral claimed!</p>
              </div>
            ) : walletId ? (
              <button onClick={handleClaim} disabled={claiming} className="btn-primary w-full !py-3 font-bold flex items-center justify-center gap-2">
                {claiming ? "Claiming..." : <><Gift className="w-4 h-4" /> Claim Referral</>}
              </button>
            ) : (
              <button onClick={() => router.push("/wallet/create")} className="btn-primary w-full !py-3 font-bold flex items-center justify-center gap-2">
                <ArrowRight className="w-4 h-4" /> Create Wallet to Claim
              </button>
            )}
          </>
        ) : (
          <>
            <h1 className="text-2xl font-heading font-bold text-white mb-2">Invalid Referral</h1>
            <p className="text-gray-400 text-sm mb-6">No referral code found in the link.</p>
            <button onClick={() => router.push("/")} className="btn-primary">Go Home</button>
          </>
        )}
      </motion.div>
    </div>
  )
}

export default function ReferralPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 flex items-center justify-center"><div className="animate-pulse text-gray-400">Loading...</div></div>}>
      <ReferralContent />
    </Suspense>
  )
}
