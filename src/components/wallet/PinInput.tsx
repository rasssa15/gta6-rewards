"use client"
import { useRef, useEffect } from "react"

interface PinInputProps {
  length?: number
  value: string
  onChange: (val: string) => void
  onComplete?: (val: string) => void
  error?: string
  disabled?: boolean
}

export function PinInput({ length = 6, value, onChange, onComplete, error, disabled }: PinInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, length)
    onChange(val)
    if (val.length === length) onComplete?.(val)
  }

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div className="flex items-center justify-center gap-3 sm:gap-4">
        {Array.from({ length }).map((_, i) => (
          <div
            key={i}
            className={`w-10 h-12 sm:w-12 sm:h-14 rounded-xl border-2 flex items-center justify-center text-xl sm:text-2xl font-bold ${
              i < value.length
                ? "border-neon-blue bg-neon-blue/10 text-white scale-105"
                : "border-white/10 bg-white/5"
            } ${error ? "border-red-500" : ""}`}
          >
            {i < value.length ? "●" : ""}
          </div>
        ))}
      </div>
      <input
        ref={inputRef}
        type="tel"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={length}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        placeholder="Enter PIN"
        className="w-64 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-lg text-center focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue/50"
        autoComplete="off"
      />
      {error && <p className="text-red-400 text-sm text-center">{error}</p>}
    </div>
  )
}
