"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Play, TrendingUp, Users, Gift, Sparkles, ChevronDown } from "lucide-react"

const stats = [
  { icon: Users, label: "Total Members", value: "84,721", suffix: "+" },
  { icon: Gift, label: "Rewards Distributed", value: "12,458", suffix: "" },
  { icon: TrendingUp, label: "Daily Active", value: "3,291", suffix: "" },
  { icon: Sparkles, label: "Scratch Cards Opened", value: "47,892", suffix: "" },
]

export function HeroSection() {
  const [liveUsers, setLiveUsers] = useState(3291)

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveUsers((prev) => prev + Math.floor(Math.random() * 3))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/0 via-[#0a0a0f]/50 to-[#0a0a0f]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neon-pink/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 w-[600px] h-[600px] bg-neon-blue/5 rounded-full blur-[100px]" />
      </div>

      <div className="page-container relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 mb-8">
            <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
            <span className="text-sm text-gray-300">
              <span className="text-neon-green font-semibold">{liveUsers.toLocaleString()}</span> users online now
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-heading font-bold leading-tight mb-6">
            <span className="gradient-text">GTA 6</span>
            <br />
            <span className="text-white">Rewards Hub</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            Earn points, unlock achievements, and redeem exclusive rewards while 
            staying up to date with the latest GTA 6 and gaming news.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/auth/register" className="btn-primary text-lg px-8 py-4 flex items-center gap-2">
              <Play className="w-5 h-5" />
              Start Earning Now
            </Link>
            <Link href="/news" className="btn-secondary text-lg px-8 py-4">
              Browse News
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="glass-card p-4 sm:p-6 text-center"
            >
              <stat.icon className="w-6 h-6 mx-auto mb-2 text-neon-blue" />
              <div className="text-2xl sm:text-3xl font-heading font-bold text-white">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-16"
        >
          <ChevronDown className="w-6 h-6 mx-auto text-gray-500 animate-bounce" />
        </motion.div>
      </div>
    </section>
  )
}
