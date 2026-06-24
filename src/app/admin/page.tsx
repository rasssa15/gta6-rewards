"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import {
  LayoutDashboard, Newspaper, Users, Gift, Sparkles, Settings,
  TrendingUp, Trophy, Eye, Star, Activity
} from "lucide-react"
import { motion } from "framer-motion"
import { formatNumber } from "@/lib/utils"

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/admin" },
  { icon: Newspaper, label: "Articles", href: "/admin/articles" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: Gift, label: "Rewards", href: "/admin/rewards" },
  { icon: Sparkles, label: "Challenges", href: "/admin/challenges" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
]

export default function AdminPage() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then(r => r.json())
      .then(setAnalytics)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="page-container">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm">Manage your platform</p>
          </div>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = item.href === "/admin"
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-neon-blue/20 text-neon-blue border border-neon-blue/30"
                    : "glass text-gray-400 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-card p-6 space-y-3">
                <div className="h-4 w-20 skeleton" />
                <div className="h-8 w-16 skeleton" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { icon: Users, label: "Total Users", value: analytics?.totalUsers || 0, color: "text-neon-blue" },
                { icon: Newspaper, label: "Articles", value: analytics?.totalArticles || 0, color: "text-neon-green" },
                { icon: Star, label: "Total Points", value: formatNumber(analytics?.totalPoints || 0), color: "text-neon-yellow" },
                { icon: Trophy, label: "Scratches", value: analytics?.totalScratches || 0, color: "text-neon-purple" },
              ].map((stat, i) => {
                const Icon = stat.icon
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card p-6"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                      <span className="text-sm text-gray-400">{stat.label}</span>
                    </div>
                    <div className={`text-3xl font-heading font-bold ${stat.color}`}>{stat.value}</div>
                  </motion.div>
                )
              })}
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-heading font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-neon-blue" /> Recent Users
              </h3>
              {analytics?.recentUsers?.length > 0 ? (
                <div className="space-y-2">
                  {analytics.recentUsers.map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center">
                          <span className="text-xs font-bold text-white">{user.name?.charAt(0) || "U"}</span>
                        </div>
                        <span className="text-sm text-white">{user.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">No users yet</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
