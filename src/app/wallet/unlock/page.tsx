"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Lock, LogOut } from "lucide-react"
import toast from "react-hot-toast"
import { validatePin, setLocked, hasWallet } from "@/lib/wallet/storage"
import { PinInput } from "@/components/wallet/PinInput"

export default function UnlockPage() {
  const router = useRouter()
  const [error, setError] = useState("")

  const handlePinComplete = async (val: string) => {
    const valid = await validatePin(val)
    if (valid) {
      setLocked(false)
      router.push("/dashboard")
    } else {
      setError("Wrong PIN")
    }
  }

  if (typeof window !== "undefined" && !hasWallet()) {
    router.replace("/")
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-20 px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-neon-purple/5 via-transparent to-neon-blue/5" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="glass-card p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center">
            <Lock className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-2xl font-heading font-bold text-white mb-2">Wallet Locked</h1>
          <p className="text-gray-400 text-sm mb-8">Enter your PIN to unlock</p>

          <PinInput
            value=""
            onChange={() => {}}
            onComplete={handlePinComplete}
            error={error}
          />

          <div className="mt-8 space-y-3">
            <button
              onClick={() => {
                setLocked(true)
                clearWallet()
                router.push("/wallet/recover")
              }}
              className="text-sm text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              <LogOut className="w-3 h-3" />
              Forgot PIN? Recover wallet
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function clearWallet() {
  const { clearWallet } = require("@/lib/wallet/storage")
  clearWallet()
}
