"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Gift, ArrowRight, Zap } from "lucide-react"

export function RewardsCenter() {
  const [rewards, setRewards] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/rewards?limit=4")
      .then((r) => r.json())
      .then((data) => {
        if (data.data) setRewards(data.data)
      })
      .catch(() => {})
  }, [])

  return (
    <section className="py-16 sm:py-20">
      <div className="page-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Gift className="w-6 h-6 text-neon-purple" />
                <h2 className="section-title mb-0">Rewards Center</h2>
              </div>
              <p className="section-subtitle">Redeem your points for exclusive rewards</p>
            </div>
            <Link href="/rewards" className="btn-ghost text-sm flex items-center gap-1">
              All Rewards <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {rewards.map((reward, i) => (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href="/rewards" className="block h-full">
                <div className="glass-card h-full p-6 text-center group">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Gift className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-heading font-bold text-white mb-2">
                    {reward.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {reward.description}
                  </p>
                  <div className="flex items-center justify-center gap-1 text-neon-yellow font-bold">
                    <Zap className="w-4 h-4" />
                    <span>{reward.cost} points</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
