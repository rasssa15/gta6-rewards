"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Gamepad2, Shield, Sparkles, Trophy, Gift, ArrowRight, Newspaper,
  TrendingUp, Users, Star, ChevronRight, Coins
} from "lucide-react"
import OnlinePlayerBadge from "@/components/ui/OnlinePlayerBadge"
import { formatNumber } from "@/lib/utils"
import { motion } from "framer-motion"

export default function HomePage() {
  const [stats, setStats] = useState({ users: 0, articles: 0, points: 0 })
  const [featuredArticles, setFeaturedArticles] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/articles?limit=3").then(r => r.json()).then(d => {
      setFeaturedArticles(d.articles || [])
    }).catch(() => {})
    fetch("/api/admin/analytics").then(r => r.json()).then(d => {
      if (d && typeof d.totalUsers === "number") setStats({
        users: d.totalUsers,
        articles: d.totalArticles,
        points: d.totalPoints,
      })
    }).catch(() => {})
  }, [])

  const features = [
    { icon: Newspaper, title: "GTA 6 News", desc: "Latest updates, rumors, and leaks" },
    { icon: Gift, title: "Rewards", desc: "Earn points, redeem gift cards" },
    { icon: Trophy, title: "Leaderboard", desc: "Compete with other players" },
    { icon: Sparkles, title: "Challenges", desc: "Daily tasks, big rewards" },
    { icon: Shield, title: "Secure Wallet", desc: "Your identity, your control" },
    { icon: Star, title: "Achievements", desc: "Unlock badges and earn XP" },
  ]

  return (
    <div className="min-h-screen">
      <section className="relative pt-20 pb-16 sm:pt-32 sm:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-neon-blue/10 via-transparent to-neon-purple/5" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-neon-blue/5 blur-[150px] pointer-events-none" />
        <div className="page-container relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-8">
              <OnlinePlayerBadge />
            </div>
            <h1 className="text-5xl sm:text-7xl font-heading font-bold mb-6">
              <span className="gradient-text">GTA 6</span>
              <br />
              <span className="text-white">Rewards Platform</span>
            </h1>
            <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10">
              Earn points, unlock achievements, read the latest GTA 6 news,
              and redeem exclusive rewards. All secured by your private wallet.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/wallet/create" className="btn-primary text-lg py-4 px-8 flex items-center gap-3">
                <Shield className="w-5 h-5" />
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/news" className="btn-secondary text-lg py-4 px-8 flex items-center gap-3">
                <Newspaper className="w-5 h-5" />
                Latest News
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-3 gap-6 max-w-lg mx-auto mt-16"
          >
            {[
              { value: stats.users || "1K+", label: "Players", icon: Users },
              { value: stats.articles || "50+", label: "Articles", icon: Newspaper },
              { value: formatNumber(stats.points) || "10K+", label: "Points Earned", icon: TrendingUp },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="w-12 h-12 rounded-xl glass flex items-center justify-center mx-auto mb-2">
                  <s.icon className="w-5 h-5 text-neon-blue" />
                </div>
                <div className="text-xl font-heading font-bold text-white">{s.value}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="page-container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-heading font-bold text-white">Latest News</h2>
            <Link href="/news" className="text-sm text-neon-blue hover:text-neon-blue/80 flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredArticles.length > 0 ? featuredArticles.map((article: any, i: number) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Link href={`/news/${article.slug}`} className="glass-card p-0 overflow-hidden group block">
                  {article.featuredImage && (
                    <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${article.featuredImage})` }} />
                  )}
                  <div className="p-5">
                    {article.category && (
                      <span className="text-[10px] uppercase tracking-wider text-neon-blue font-semibold">
                        {article.category.name}
                      </span>
                    )}
                    <h3 className="text-white font-semibold mt-1 group-hover:text-neon-blue transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-gray-400 text-sm mt-2 line-clamp-2">{article.excerpt}</p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                      <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                      <span>{article.readingTime} min read</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )) : (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="glass-card p-0 overflow-hidden">
                  <div className="h-48 skeleton" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 w-20 skeleton" />
                    <div className="h-5 w-full skeleton" />
                    <div className="h-4 w-3/4 skeleton" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent">
        <div className="page-container">
          <h2 className="text-2xl font-heading font-bold text-white text-center mb-12">
            Everything in One Platform
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  viewport={{ once: true }}
                  className="glass-card p-6 text-center hover:border-neon-blue/30"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-neon-blue" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                  <p className="text-gray-400 text-sm">{f.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="page-container text-center">
          <div className="glass-card p-10 sm:p-16 max-w-3xl mx-auto relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 via-transparent to-neon-purple/5" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-4">
                Ready to Join?
              </h2>
              <p className="text-gray-400 max-w-lg mx-auto mb-8">
                Create your secure wallet in under a minute. No email, no password — just your private keys.
              </p>
              <Link href="/wallet/create" className="btn-primary text-lg py-4 px-10 inline-flex items-center gap-3">
                <Shield className="w-5 h-5" />
                Create Your Wallet
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
