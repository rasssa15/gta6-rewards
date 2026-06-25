"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function OnlinePlayerBadge() {
  const [data, setData] = useState<{ fakePlayers: number; realPlayers: number; total: number } | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/online-players")
        const d = await res.json()
        setData(d)
      } catch {}
    }
    fetchData()
    const interval = setInterval(fetchData, 15000)
    return () => clearInterval(interval)
  }, [])

  if (!data) return null

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={data.total}
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 5 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass"
      >
        <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
        <span className="text-xs text-neon-green font-semibold">
          {data.total.toLocaleString()} players online
        </span>
      </motion.div>
    </AnimatePresence>
  )
}
