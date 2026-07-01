"use client"
import { useState, useEffect } from "react"


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
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass">
        <span className="w-2 h-2 rounded-full bg-neon-green" />
        <span className="text-xs text-neon-green font-semibold">
          {data.total.toLocaleString()} players online
        </span>
      </div>
  )
}
