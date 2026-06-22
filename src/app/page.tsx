"use client"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Shield, RotateCcw, Gamepad2, Sparkles, Lock, KeyRound } from "lucide-react"
import { hasWallet } from "@/lib/wallet/storage"

export default function HomePage() {
  const router = useRouter()

  const walletExists = typeof window !== "undefined" ? hasWallet() : false

  return (
    <div className="min-h-screen flex items-center justify-center py-20 px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-neon-blue/5 via-transparent to-neon-purple/5" />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-neon-blue/5 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center relative"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-neon-pink via-neon-purple to-neon-blue flex items-center justify-center shadow-2xl shadow-neon-purple/25"
        >
          <Gamepad2 className="w-12 h-12 text-white" />
        </motion.div>

        <h1 className="text-4xl sm:text-5xl font-heading font-bold gradient-text mb-4">
          GTA 6 Rewards
        </h1>

        <p className="text-gray-400 text-lg mb-12 max-w-sm mx-auto">
          Your wallet is your identity. Create a secure wallet to track your rewards, achievements, and progress.
        </p>

        <div className="space-y-4">
          {walletExists ? (
            <>
              <button
                onClick={() => router.push("/wallet/unlock")}
                className="btn-primary w-full text-lg py-4 flex items-center justify-center gap-3"
              >
                <Lock className="w-5 h-5" />
                Unlock Wallet
              </button>
              <button
                onClick={() => {
                  const { clearWallet } = require("@/lib/wallet/storage")
                  clearWallet()
                  window.location.reload()
                }}
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                Reset wallet (start over)
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => router.push("/wallet/create")}
                className="btn-primary w-full text-lg py-4 flex items-center justify-center gap-3"
              >
                <Shield className="w-5 h-5" />
                Create New Wallet
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 text-sm text-gray-500 bg-[#0a0a0f]">or</span>
                </div>
              </div>

              <button
                onClick={() => router.push("/wallet/recover")}
                className="btn-secondary w-full text-lg py-4 flex items-center justify-center gap-3"
              >
                <RotateCcw className="w-5 h-5" />
                Recover Wallet
              </button>
            </>
          )}
        </div>

        <div className="mt-12 grid grid-cols-3 gap-4 max-w-sm mx-auto">
          {[
            { icon: Shield, label: "Secure", desc: "AES-256 encrypted" },
            { icon: KeyRound, label: "12 Words", desc: "Easy recovery" },
            { icon: Sparkles, label: "Free", desc: "No server needed" },
          ].map((feature) => (
            <div key={feature.label} className="text-center">
              <div className="w-10 h-10 rounded-xl glass flex items-center justify-center mx-auto mb-2">
                <feature.icon className="w-5 h-5 text-neon-blue" />
              </div>
              <div className="text-xs font-semibold text-white">{feature.label}</div>
              <div className="text-[10px] text-gray-500">{feature.desc}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
