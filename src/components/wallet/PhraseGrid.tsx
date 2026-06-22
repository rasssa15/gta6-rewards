"use client"
import { useState } from "react"
import { motion } from "framer-motion"

interface PhraseGridProps {
  words: string[]
  onConfirm?: () => void
  editable?: boolean
  onChange?: (words: string[]) => void
}

export function PhraseGrid({ words, onConfirm, editable, onChange }: PhraseGridProps) {
  const [confirmed, setConfirmed] = useState(false)
  const [input, setInput] = useState("")

  if (editable) {
    return (
      <div className="space-y-4">
        <textarea
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            onChange?.(e.target.value.toLowerCase().trim().split(/\s+/).filter(Boolean))
          }}
          placeholder="Paste or type your 12-word recovery phrase..."
          className="input-field min-h-[120px] resize-none text-center text-sm"
          rows={4}
        />
        <p className="text-xs text-gray-500 text-center">
          Enter each word separated by a space
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
        {words.map((word, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="glass p-3 rounded-xl flex items-center gap-2"
          >
            <span className="text-xs text-gray-500 w-5 text-right shrink-0">{i + 1}</span>
            <span className="text-sm font-medium text-white">{word}</span>
          </motion.div>
        ))}
      </div>

      {!confirmed ? (
        <button
          onClick={() => setConfirmed(true)}
          className="btn-primary w-full"
        >
          I've Saved My Recovery Phrase
        </button>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <div className="p-4 rounded-xl bg-neon-yellow/10 border border-neon-yellow/20">
            <p className="text-sm text-neon-yellow text-center">
              Make sure you have saved these 12 words somewhere safe. You will need them to recover your wallet.
            </p>
          </div>
          <button onClick={onConfirm} className="btn-primary w-full">
            Continue
          </button>
        </motion.div>
      )}
    </div>
  )
}
