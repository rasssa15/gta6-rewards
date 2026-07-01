"use client"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Gamepad2, Shield, Sparkles, Trophy, Gift, ArrowRight, Newspaper,
  TrendingUp, Users, Star, ChevronRight, Coins, Zap, Play, Eye
} from "lucide-react"
import OnlinePlayerBadge from "@/components/ui/OnlinePlayerBadge"
import { useWallet } from "@/components/providers/WalletProvider"
import { AdBanner } from "@/components/ads/AdBanner"

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true) },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return
    let frame = 0
    const duration = 1800
    const fps = 60
    const totalFrames = (duration / 1000) * fps
    const timer = setInterval(() => {
      frame++
      const progress = Math.min(frame / totalFrames, 1)
      const eased = 1 - Math.pow(1 - progress, 4)
      setCount(Math.floor(eased * target))
      if (progress === 1) clearInterval(timer)
    }, 1000 / fps)
    return () => clearInterval(timer)
  }, [started, target])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

const features = [
  {
    icon: Newspaper,
    title: "GTA 6 News",
    desc: "Real-time updates, leaks, and exclusive reveals — always first, always fresh.",
    href: "/news",
    color: "from-neon-blue/20 to-cyan-500/10",
    glow: "group-hover:shadow-neon-blue/20",
    iconColor: "text-neon-blue",
  },
  {
    icon: Gift,
    title: "Rewards",
    desc: "Turn your points into real gift cards for Steam, Xbox, PlayStation and more.",
    href: "/rewards",
    color: "from-neon-green/20 to-emerald-500/10",
    glow: "group-hover:shadow-neon-green/20",
    iconColor: "text-neon-green",
  },
  {
    icon: Trophy,
    title: "Leaderboard",
    desc: "Rise through the ranks. Compete globally, earn bragging rights.",
    href: "/leaderboard",
    color: "from-neon-yellow/20 to-amber-500/10",
    glow: "group-hover:shadow-neon-yellow/20",
    iconColor: "text-neon-yellow",
  },
  {
    icon: Sparkles,
    title: "Challenges",
    desc: "Fresh daily tasks. Complete them for scratch cards and bonus XP.",
    href: "/challenges",
    color: "from-neon-purple/20 to-pink-500/10",
    glow: "group-hover:shadow-neon-purple/20",
    iconColor: "text-neon-purple",
  },
  {
    icon: Eye,
    title: "Watch Ads",
    desc: "Watch short ads and instantly earn scratch cards. Every view pays.",
    href: "/ads",
    color: "from-neon-orange/20 to-red-500/10",
    glow: "group-hover:shadow-neon-orange/20",
    iconColor: "text-neon-orange",
  },
  {
    icon: Shield,
    title: "Secure Wallet",
    desc: "Your identity, your control. Zero email, zero password — just your private keys.",
    href: "/wallet/create",
    color: "from-neon-pink/20 to-rose-500/10",
    glow: "group-hover:shadow-neon-pink/20",
    iconColor: "text-neon-pink",
  },
]

const howItWorks = [
  { step: "01", icon: Shield, title: "Create Wallet", desc: "No email. No password. Just a 12-word phrase and a PIN. Fully private." },
  { step: "02", icon: Eye, title: "Earn Points", desc: "Read articles, watch ads, complete challenges, and play scratch cards." },
  { step: "03", icon: Gift, title: "Redeem Rewards", desc: "Spend your points on real gift cards for your favorite gaming platforms." },
]

export default function HomePage() {
  const { isConnected, walletId, isLoading } = useWallet()
  const [stats, setStats] = useState({ users: 80000, articles: 50, points: 12500000 })
  const [featuredArticles, setFeaturedArticles] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/articles?limit=3").then(r => r.json()).then(d => {
      setFeaturedArticles(d.articles || [])
    }).catch(() => {})
    fetch("/api/admin/analytics").then(r => r.json()).then(d => {
      if (d && typeof d.totalUsers === "number") setStats({
        users: Math.max(d.totalUsers, 80000),
        articles: Math.max(d.totalArticles, 50),
        points: 12500000,
      })
    }).catch(() => {})
  }, [])

  return (
    <div className="min-h-screen">
      {/* ---- HERO ---- */}
      <section className="hero-section relative min-h-[90vh] sm:min-h-screen flex flex-col justify-center overflow-hidden">
        {/* Cityscape background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-cityscape.png"
            alt="GTA 6 Neon City"
            fill
            priority
            className="object-cover object-center opacity-35"
          />
          {/* Dark overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#070710]/60 via-[#070710]/40 to-[#070710]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070710]/80 via-transparent to-[#070710]/80" />
        </div>

        {/* Animated orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-neon-purple/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-neon-blue/10 blur-[100px] pointer-events-none" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-neon-pink/5 blur-[150px] pointer-events-none" />

        <div
          className="page-container relative z-10 text-center py-32 sm:py-40"
        >
          <div>
            <div className="mb-8 flex justify-center">
              <OnlinePlayerBadge />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-neon-pink/20 text-xs font-semibold text-neon-pink uppercase tracking-widest mb-8">
              <Zap className="w-3 h-3" />
              <span>GTA 6 Rewards Platform — Now Live</span>
            </div>

            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-heading font-black mb-6 leading-none tracking-tight">
              <span className="gradient-text">GTA 6</span>
              <br />
              <span className="text-white">Rewards</span>
            </h1>

            <p className="text-gray-300 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              The ultimate GTA 6 fan platform. Earn points through news, ads & challenges —
              then redeem them for <span className="text-neon-green font-semibold">real gaming rewards</span>.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isConnected && walletId ? (
                <Link
                  href="/dashboard"
                  className="btn-primary text-base sm:text-lg py-4 px-8 flex items-center gap-3 shine-effect"
                >
                  <Shield className="w-5 h-5" />
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <Link
                  href="/wallet/create"
                  className="btn-primary text-base sm:text-lg py-4 px-8 flex items-center gap-3 shine-effect"
                  id="hero-cta-create"
                >
                  <Shield className="w-5 h-5" />
                  Start Earning Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
              )}
              <Link
                href="/earn"
                className="btn-secondary text-base sm:text-lg py-4 px-8 flex items-center gap-3"
                id="hero-cta-earn"
              >
                <Play className="w-5 h-5" />
                How It Works
              </Link>
            </div>
          </div>

          {/* Stats row */}
          <div
            className="grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto mt-16 sm:mt-20"
          >
            {[
              { value: stats.users, suffix: "+", label: "Players Joined", icon: Users, color: "text-neon-blue" },
              { value: stats.articles, suffix: "+", label: "GTA 6 Articles", icon: Newspaper, color: "text-neon-purple" },
              { value: 12500, suffix: "K+", label: "Points Earned", icon: TrendingUp, color: "text-neon-green" },
            ].map((s) => (
              <div key={s.label} className="stat-card rounded-2xl">
                <s.icon className={`w-5 h-5 ${s.color} mx-auto mb-2`} />
                <div className={`text-xl sm:text-2xl font-heading font-black ${s.color} counter-value`}>
                  <AnimatedCounter target={s.value} suffix={s.suffix} />
                </div>
                <div className="text-[10px] sm:text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
        >
          <span className="text-xs text-gray-600 uppercase tracking-widest">Scroll</span>
          <div
            className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center p-1"
          >
            <div className="w-1 h-2 rounded-full bg-neon-pink" />
          </div>
        </div>
      </section>

      {/* ---- 728×90 AD ---- */}
      <div className="page-container py-4">
        <AdBanner adKey="7e7419c72404cab7787c27dfdac31321" height={90} width={728} className="flex justify-center" />
      </div>

      {/* ---- HOW IT WORKS ---- */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-purple/5 to-transparent pointer-events-none" />
        <div className="page-container">
          <div
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neon-purple/10 border border-neon-purple/20 text-xs text-neon-purple uppercase tracking-widest font-semibold mb-4">
              <Sparkles className="w-3 h-3" />
              Simple Process
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-4">
              Earn & Redeem in 3 Steps
            </h2>
            <p className="text-gray-400 max-w-lg mx-auto">
              No credit card, no sign-up hassle. Just create a wallet and start earning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector lines */}
            <div className="hidden md:block absolute top-16 left-1/3 right-1/3 h-px bg-gradient-to-r from-neon-pink/40 to-neon-purple/40 z-0" />
            <div className="hidden md:block absolute top-16 left-2/3 right-0 h-px bg-gradient-to-r from-neon-purple/40 to-neon-blue/40 z-0" />

            {howItWorks.map((step, i) => {
              const Icon = step.icon
              return (
                <div
                  key={step.step}
                  className="relative z-10 text-center"
                >
                  <div className="relative inline-flex mb-6">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto feature-icon">
                      <Icon className="w-7 h-7 text-neon-pink" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-neon-pink to-neon-purple flex items-center justify-center text-white text-[10px] font-black font-mono">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="text-white font-heading font-bold text-lg mb-2">{step.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">{step.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ---- LATEST NEWS ---- */}
      <section className="py-16 sm:py-20">
        <div className="page-container">
          <div
            className="flex items-center justify-between mb-10"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-blue/10 border border-neon-blue/20 text-xs text-neon-blue uppercase tracking-widest font-semibold mb-3">
                <Newspaper className="w-3 h-3" />
                Fresh News
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white">Latest GTA 6 Updates</h2>
            </div>
            <Link href="/news" className="hidden sm:flex items-center gap-1.5 text-sm text-neon-blue hover:text-neon-blue/80 font-semibold">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredArticles.length > 0
              ? featuredArticles.map((article: any, i: number) => (
                <div
                  key={article.id}
                >
                  <Link href={`/news/${article.slug}`} className="glass-card p-0 overflow-hidden group block neon-glow-card shine-effect" id={`news-card-${i}`}>
                    {article.featuredImage ? (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={article.featuredImage}
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-neon-blue/10 to-neon-purple/10 flex items-center justify-center">
                        <Newspaper className="w-12 h-12 text-gray-600" />
                      </div>
                    )}
                    <div className="p-5">
                      {article.category && (
                        <span className="text-[10px] uppercase tracking-wider text-neon-blue font-bold">
                          {article.category.name}
                        </span>
                      )}
                      <h3 className="text-white font-semibold mt-1.5 group-hover:text-neon-blue line-clamp-2 leading-snug">
                        {article.title}
                      </h3>
                      <p className="text-gray-400 text-sm mt-2 line-clamp-2 leading-relaxed">{article.excerpt}</p>
                      <div className="flex items-center justify-between mt-4 text-xs text-gray-600">
                        <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1 text-neon-green">
                          <Coins className="w-3 h-3" />
                          Earn points
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))
              : Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="glass-card p-0 overflow-hidden">
                  <div className="h-48 skeleton" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 w-20 skeleton" />
                    <div className="h-5 w-full skeleton" />
                    <div className="h-4 w-3/4 skeleton" />
                  </div>
                </div>
              ))}
          </div>

          <div className="text-center mt-8 sm:hidden">
            <Link href="/news" className="btn-secondary text-sm py-3 px-6 inline-flex items-center gap-2">
              View All News <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ---- 728×90 AD ---- */}
      <div className="page-container py-4">
        <AdBanner adKey="7e7419c72404cab7787c27dfdac31321" height={90} width={728} className="flex justify-center" />
      </div>

      {/* ---- FEATURES GRID ---- */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-blue/3 to-transparent pointer-events-none" />
        <div className="page-container">
          <div
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neon-green/10 border border-neon-green/20 text-xs text-neon-green uppercase tracking-widest font-semibold mb-4">
              <Star className="w-3 h-3" />
              Everything Included
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-4">
              One Platform. Everything You Need.
            </h2>
            <p className="text-gray-400 max-w-lg mx-auto">
              Built for serious GTA 6 fans. News, rewards, community — all in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <div
                  key={f.title}
                >
                  <Link href={f.href} className={`glass-card p-6 group flex flex-col gap-4 block neon-glow-card shine-effect h-full`} id={`feature-${f.title.toLowerCase().replace(" ", "-")}`}>
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center feature-icon flex-shrink-0`}>
                      <Icon className={`w-6 h-6 ${f.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="text-white font-heading font-bold mb-2 group-hover:gradient-text">{f.title}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs font-semibold ${f.iconColor} mt-auto`}>
                      Explore <ArrowRight className="w-3 h-3" />
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ---- REWARDS BANNER ---- */}
      <section className="py-16 sm:py-20">
        <div className="page-container">
          <div
            className="relative rounded-3xl overflow-hidden"
          >
            {/* Background image */}
            <div className="absolute inset-0 z-0">
              <Image
                src="/images/rewards-banner.png"
                alt="Rewards"
                fill
                className="object-cover object-center opacity-30"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#070710]/95 via-[#070710]/70 to-[#070710]/80" />
            </div>

            {/* Glow orbs */}
            <div className="absolute top-0 right-1/4 w-64 h-64 rounded-full bg-neon-yellow/10 blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full bg-neon-green/10 blur-[60px] pointer-events-none" />

            <div className="relative z-10 p-10 sm:p-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-yellow/30 to-neon-green/20 flex items-center justify-center mx-auto mb-6 border border-neon-yellow/20">
                <Trophy className="w-8 h-8 text-neon-yellow" />
              </div>
              <h2 className="text-3xl sm:text-5xl font-heading font-bold text-white mb-4">
                Start Earning{" "}
                <span className="gradient-text-green">Today</span>
              </h2>
              <p className="text-gray-300 max-w-xl mx-auto mb-8 text-base sm:text-lg leading-relaxed">
                Create your free wallet in under a minute. No email, no password.
                Just your private phrase — and a world of rewards waiting.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {isConnected && walletId ? (
                  <Link href="/dashboard" className="btn-primary text-base py-4 px-10 flex items-center gap-3 shine-effect">
                    <Shield className="w-5 h-5" />
                    Go to Dashboard <ArrowRight className="w-5 h-5" />
                  </Link>
                ) : (
                  <Link href="/wallet/create" className="btn-primary text-base py-4 px-10 flex items-center gap-3 shine-effect" id="cta-create-wallet">
                    <Shield className="w-5 h-5" />
                    Create Free Wallet
                  </Link>
                )}
                <Link href="/rewards" className="btn-secondary text-base py-4 px-8 flex items-center gap-3" id="cta-view-rewards">
                  <Gift className="w-5 h-5" />
                  Browse Rewards
                </Link>
              </div>
              <p className="text-gray-600 text-xs mt-6 font-mono">
                🔐 AES-256 encrypted · 🌐 No email required · ⚡ Instant setup
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
