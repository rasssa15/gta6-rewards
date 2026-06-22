"use client"
import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, ArrowLeft, ArrowRight, Eye, EyeOff, Copy, Check } from "lucide-react"
import toast from "react-hot-toast"
import { generatePhrase } from "@/lib/wallet/phrase"
import { saveWallet } from "@/lib/wallet/storage"
import { PhraseGrid } from "@/components/wallet/PhraseGrid"
import { PinInput } from "@/components/wallet/PinInput"

type Step = "intro" | "phrase" | "confirm" | "pin" | "done"

export default function CreateWalletPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("intro")
  const [phrase, setPhrase] = useState<string[]>([])
  const [pin, setPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [pinError, setPinError] = useState("")
  const [name, setName] = useState("")
  const [copied, setCopied] = useState(false)
  const [showPhrase, setShowPhrase] = useState(true)

  const handleStart = useCallback(() => {
    setPhrase(generatePhrase())
    setStep("phrase")
  }, [])

  const handlePhraseConfirmed = () => setStep("pin")

  const handlePinComplete = async (val: string) => {
    if (step === "pin" && !confirmPin) {
      setConfirmPin(val)
      setPinError("")
    } else if (step === "pin" && confirmPin) {
      if (val !== confirmPin) {
        setPinError("PINs do not match")
        setConfirmPin("")
        return
      }
      const displayName = name.trim() || "Player"
      await saveWallet({ name: displayName, createdAt: new Date().toISOString(), avatarIndex: 0 }, val)
      toast.success("Wallet created!")
      router.push("/dashboard")
    }
  }

  const copyPhrase = () => {
    navigator.clipboard.writeText(phrase.join(" "))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success("Phrase copied!")
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-20 px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-neon-blue/5 via-transparent to-neon-purple/5" />

      {step !== "intro" && (
        <button onClick={() => router.push("/")} className="fixed top-24 left-4 z-40 p-2 rounded-xl glass hover:bg-white/10 transition-all">
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </button>
      )}

      <motion.div
        key={step}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative"
      >
        {step === "intro" && (
          <div className="glass-card p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-heading font-bold text-white mb-4">Create Your Wallet</h1>
            <p className="text-gray-400 mb-6 max-w-sm mx-auto">
              Your wallet is your identity. A 12-word recovery phrase will be generated — write it down. You'll need it to recover your account.
            </p>
            <div className="space-y-3 text-left mb-8">
              {[
                "Your 12-word phrase is stored only on this device",
                "Never share your recovery phrase with anyone",
                "If you lose your phrase, your wallet is gone forever",
                "Set a 6-digit PIN for quick access",
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-neon-blue/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-neon-blue text-xs font-bold">{i + 1}</span>
                  </div>
                  <p className="text-sm text-gray-300">{tip}</p>
                </div>
              ))}
            </div>
            <button onClick={handleStart} className="btn-primary w-full text-lg py-4">
              Generate My Wallet
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {step === "phrase" && (
          <div className="glass-card p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-heading font-bold text-white">Your Recovery Phrase</h2>
              <div className="flex gap-2">
                <button onClick={() => setShowPhrase(!showPhrase)} className="p-2 rounded-lg glass hover:bg-white/10 transition-all">
                  {showPhrase ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                </button>
                <button onClick={copyPhrase} className="p-2 rounded-lg glass hover:bg-white/10 transition-all">
                  {copied ? <Check className="w-4 h-4 text-neon-green" /> : <Copy className="w-4 h-4 text-gray-400" />}
                </button>
              </div>
            </div>
            <div className={showPhrase ? "" : "blur-lg select-none"}>
              <PhraseGrid words={phrase} onConfirm={handlePhraseConfirmed} />
            </div>
            {!showPhrase && (
              <p className="text-xs text-gray-500 text-center mt-3">Tap the eye icon to reveal your phrase</p>
            )}
          </div>
        )}

        {step === "pin" && (
          <div className="glass-card p-8 text-center">
            <h2 className="text-xl font-heading font-bold text-white mb-2">
              {!confirmPin ? "Set Your PIN" : "Confirm Your PIN"}
            </h2>
            <p className="text-gray-400 text-sm mb-8">
              {!confirmPin
                ? "Choose a 6-digit PIN to unlock your wallet"
                : "Enter the same PIN again to confirm"}
            </p>

            <div className="space-y-4 mb-6">
              {!confirmPin && (
                <div>
                  <label className="text-sm text-gray-400 mb-1 block text-left">Your Name (optional)</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your display name"
                    className="input-field text-center"
                    maxLength={20}
                  />
                </div>
              )}
              <PinInput
                value={step === "pin" && confirmPin ? confirmPin.slice(0, pin.length) : pin}
                onChange={(val) => {
                  if (!confirmPin) setPin(val)
                }}
                onComplete={(val) => {
                  if (!confirmPin) {
                    setPin(val)
                    setConfirmPin("")
                  }
                }}
                error={pinError}
              />
            </div>

            {confirmPin && (
              <div className="space-y-4">
                <PinInput
                  value=""
                  onChange={(val) => {}}
                  onComplete={(val) => handlePinComplete(val)}
                  error={pinError}
                />
                <button
                  onClick={() => { setConfirmPin(""); setPin(""); setPinError("") }}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Start over
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}
