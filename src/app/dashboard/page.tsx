"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { User, Shield, Lock, Calendar, Clock, LogOut, Copy, Check, Gamepad2 } from "lucide-react"
import toast from "react-hot-toast"
import { WalletGuard } from "@/components/wallet/WalletGuard"
import { loadWallet, setLocked, clearWallet, WalletData } from "@/lib/wallet/storage"

export default function DashboardPage() {
  const router = useRouter()
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const load = async () => {
      const w = localStorage.getItem("gta6_wallet")
      if (!w) return
      try {
        const { decrypt } = await import("@/lib/wallet/crypto")
        const { loadWallet } = await import("@/lib/wallet/storage")
      } catch {}
    }
    load()
  }, [])

  const handleLock = () => {
    setLocked(true)
    router.push("/wallet/unlock")
  }

  const handleReset = () => {
    clearWallet()
    router.push("/")
  }

  const stats = [
    { icon: Shield, label: "Status", value: "Active", color: "text-neon-green", bg: "bg-neon-green/10" },
    { icon: Calendar, label: "Created", value: wallet ? new Date(wallet.createdAt).toLocaleDateString() : "-", color: "text-neon-blue", bg: "bg-neon-blue/10" },
    { icon: Clock, label: "Version", value: "Wallet v1", color: "text-neon-purple", bg: "bg-neon-purple/10" },
  ]

  return (
    <WalletGuard>
      <div className="min-h-screen pt-20 pb-12">
        <div className="page-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 sm:p-8 mb-8"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center text-3xl font-bold text-white shrink-0">
                {wallet?.name?.[0] || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-heading font-bold text-white mb-1">
                  {wallet?.name || "Player"}
                </h1>
                <p className="text-gray-400 text-sm mb-3 flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4 text-neon-blue" />
                  Wallet secured with AES-256 encryption
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={handleLock} className="btn-secondary text-sm flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Lock
                </button>
                <button onClick={handleReset} className="btn-secondary text-sm flex items-center gap-2 text-red-400">
                  <LogOut className="w-4 h-4" />
                  Reset
                </button>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-4 text-center"
              >
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mx-auto mb-2`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className={`text-lg font-heading font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-heading font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-neon-green" />
                Security
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-white/5">
                  <span className="text-sm text-gray-300">Encryption</span>
                  <span className="text-sm text-neon-green">AES-256-GCM</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-white/5">
                  <span className="text-sm text-gray-300">Key Derivation</span>
                  <span className="text-sm text-neon-blue">PBKDF2 (100k rounds)</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-white/5">
                  <span className="text-sm text-gray-300">Storage</span>
                  <span className="text-sm text-gray-400">Browser Local (encrypted)</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-gray-300">Recovery</span>
                  <span className="text-sm text-gray-400">12-word phrase</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-heading font-bold text-white mb-4 flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-neon-purple" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Lock Wallet", desc: "Secure your session", icon: Lock, action: handleLock },
                  { label: "Recovery Phrase", desc: "View your 12 words (not saved here)", icon: Copy, action: () => toast.success("Recovery phrase is stored only on paper you wrote down") },
                  { label: "Reset Wallet", desc: "Start over with a new wallet", icon: LogOut, action: handleReset },
                ].map((action) => (
                  <button
                    key={action.label}
                    onClick={action.action}
                    className="w-full flex items-center gap-4 p-3 rounded-xl glass hover:bg-white/10 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center">
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold text-white">{action.label}</div>
                      <div className="text-xs text-gray-400">{action.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </WalletGuard>
  )
}
