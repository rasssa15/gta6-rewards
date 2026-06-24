"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { RotateCcw, ArrowLeft, ArrowRight } from "lucide-react"
import toast from "react-hot-toast"
import { stringToPhrase, validatePhrase } from "@/lib/wallet/phrase"
import { saveWallet } from "@/lib/wallet/storage"
import { PhraseGrid } from "@/components/wallet/PhraseGrid"
import { PinInput } from "@/components/wallet/PinInput"

type Step = "phrase" | "pin" | "done"

export default function RecoverWalletPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("phrase")
  const [enteredWords, setEnteredWords] = useState<string[]>([])
  const [error, setError] = useState("")
  const [pin, setPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [confirmPinValue, setConfirmPinValue] = useState("")
  const [pinError, setPinError] = useState("")

  const handlePhraseChange = (words: string[]) => {
    setEnteredWords(words)
    setError("")
  }

  const handleSubmitPhrase = () => {
    if (!validatePhrase(enteredWords)) {
      setError("Invalid recovery phrase. Check each word is spelled correctly.")
      return
    }
    if (enteredWords.length !== 12) {
      setError("Enter exactly 12 words")
      return
    }
    setStep("pin")
  }

  const handlePinComplete = async (val: string) => {
    if (!confirmPin) {
      setPin(val)
      setConfirmPin(val)
      setPinError("")
      setConfirmPinValue("")
    } else {
      if (val !== confirmPin) {
        setPinError("PINs do not match")
        setConfirmPin("")
        setPin("")
        setConfirmPinValue("")
        return
      }
      const walletId = crypto.randomUUID()
      await saveWallet({ walletId, name: "Recovered", createdAt: new Date().toISOString(), avatarIndex: 0 }, val)
      toast.success("Wallet recovered successfully!")
      router.push("/dashboard")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-20 px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-neon-green/5 via-transparent to-neon-blue/5" />
      <button onClick={() => router.push("/")} className="fixed top-24 left-4 z-40 p-2 rounded-xl glass hover:bg-white/10 transition-all">
        <ArrowLeft className="w-5 h-5 text-gray-400" />
      </button>

      <div className="w-full max-w-lg">
        {step === "phrase" && (
          <div className="glass-card p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-neon-green to-neon-blue flex items-center justify-center">
                <RotateCcw className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-heading font-bold text-white mb-2">Recover Wallet</h1>
              <p className="text-gray-400 text-sm">Enter your 12-word recovery phrase</p>
            </div>
            <PhraseGrid words={enteredWords} editable onChange={handlePhraseChange} />
            {error && <p className="text-red-400 text-sm text-center mt-3">{error}</p>}
            <button
              onClick={handleSubmitPhrase}
              disabled={enteredWords.length < 12}
              className="btn-primary w-full mt-6"
            >
              Recover Wallet <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === "pin" && (
          <div className="glass-card p-8 text-center">
            <h2 className="text-xl font-heading font-bold text-white mb-2">Set New PIN</h2>
            <p className="text-gray-400 text-sm mb-8">
              {!confirmPin ? "Choose a 6-digit PIN" : "Enter the same PIN again to confirm"}
            </p>
            <div className="space-y-6">
              <PinInput
                value={pin}
                onChange={setPin}
                onComplete={handlePinComplete}
                error={pinError}
              />
              {confirmPin && (
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <h3 className="text-sm text-gray-400">Re-enter your PIN to confirm</h3>
                  <PinInput
                    value={confirmPinValue}
                    onChange={setConfirmPinValue}
                    onComplete={handlePinComplete}
                    error={pinError}
                  />
                  <button onClick={() => { setConfirmPin(""); setPin(""); setConfirmPinValue(""); setPinError("") }}
                    className="text-sm text-gray-400 hover:text-white transition-colors">
                    Start over
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
