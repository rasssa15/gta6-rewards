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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-center gap-3 sm:gap-4" onClick={() => inputRef.current?.focus()}>
        {Array.from({ length }).map((_, i) => (
          <div
            key={i}
            className={`w-10 h-12 sm:w-12 sm:h-14 rounded-xl border-2 flex items-center justify-center text-xl sm:text-2xl font-bold transition-all duration-200 ${
              i < value.length
                ? "border-neon-blue bg-neon-blue/10 text-white scale-105"
                : "border-white/10 bg-white/5 text-transparent"
            } ${error ? "border-red-500 animate-shake" : ""}`}
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
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className="absolute opacity-0 pointer-events-none"
        autoComplete="off"
      />
      {error && <p className="text-red-400 text-sm text-center mt-3">{error}</p>}
    </div>
  )
}
