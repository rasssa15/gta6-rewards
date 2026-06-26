"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Lock, LogOut } from "lucide-react"
import toast from "react-hot-toast"
import { validatePin, setLocked, hasWallet, loadWallet, setSession } from "@/lib/wallet/storage"
import { PinInput } from "@/components/wallet/PinInput"

export default function UnlockPage() {
  const router = useRouter()
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!hasWallet()) {
      router.replace("/")
    }
  }, [router])

  if (!mounted) return null

  const handlePinComplete = async (val: string) => {
    const valid = await validatePin(val)
    if (valid) {
      setLocked(false)
      const wallet = await loadWallet(val)
      if (wallet) {
        setSession({ walletId: wallet.walletId, name: wallet.name })
      }
      router.push("/dashboard")
    } else {
      setError("Wrong PIN")
      setPin("")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-20 px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-neon-purple/5 via-transparent to-neon-blue/5" />

      <div className="w-full max-w-sm">
        <div className="glass-card p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center">
            <Lock className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-2xl font-heading font-bold text-white mb-2">Wallet Locked</h1>
          <p className="text-gray-400 text-sm mb-8">Enter your PIN to unlock</p>

          <PinInput
            value={pin}
            onChange={setPin}
            onComplete={handlePinComplete}
            error={error}
          />

          <div className="mt-8 space-y-3">
            <button
              onClick={() => {
                setLocked(true)
                router.push("/wallet/login")
              }}
              className="text-sm text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              <LogOut className="w-3 h-3" />
              Forgot PIN? Use recovery phrase
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
