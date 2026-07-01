"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  User, Shield, Lock, Calendar, Gamepad2, Gift, Trophy, Sparkles,
  Star, TrendingUp, Clock, Eye, LogOut, Copy, Check, Zap, Medal, Link as LinkIcon, Users, Palette, Globe
} from "lucide-react"
import toast from "react-hot-toast"
import { WalletGuard } from "@/components/wallet/WalletGuard"
import { getSession, clearWallet, setLocked } from "@/lib/wallet/storage"
import { formatDate, formatNumber } from "@/lib/utils"
import { useTheme } from "@/components/ThemeProvider"
import { AdBanner } from "@/components/ads/AdBanner"

export default function DashboardPage() {
  const router = useRouter()
  const [wallet, setWallet] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("overview")
  const [scratchResult, setScratchResult] = useState<{ points: number; tier: string; emoji: string } | null>(null)
  const [scratching, setScratching] = useState(false)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const session = getSession()
    setWallet(session)
    if (session?.walletId) {
      fetch(`/api/users/${session.walletId}`)
        .then(r => r.json())
        .then(d => setUserData(d))
        .catch(() => {})
      fetch(`/api/points?userId=${session.walletId}&limit=20`)
        .then(r => r.json())
        .then(d => setHistory(d.transactions || []))
        .catch(() => {})
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        window.open("https://www.effectivecpmnetwork.com/ferya5qq?key=0fdf4c14f0056af80dff7d2b13c4d1ee", "_blank")
      } catch {}
    }, 30000)
    return () => clearTimeout(timer)
  }, [])

  const handleLock = () => {
    setLocked(true)
    router.push("/wallet/unlock")
  }

  const handleReset = () => {
    clearWallet()
    router.push("/")
  }

  const handleScratch = async () => {
    if (!wallet?.walletId) return
    if (scratching || revealed) return
    setScratching(true)
    setRevealed(false)
    setScratchResult(null)
    try {
      const res = await fetch("/api/scratch-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletId: wallet.walletId }),
      })
      const data = await res.json()
      setScratchResult({ points: data.points, tier: data.tier, emoji: data.emoji })
      setRevealed(true)
      if (data.points > 0) toast.success(`${data.emoji} ${data.label} Card! +${data.points} points!`)
      else toast("No luck this time!")
    } catch {
      toast.error("Failed to play")
    }
    setScratching(false)
  }

  const level = userData?.level || 1
  const points = userData?.points || 0
  const xp = userData?.xp || 0
  const xpForNext = level * 100
  const xpProgress = (xp % 100) / 100

  const stats = [
    { icon: Star, label: "Points", value: formatNumber(points), color: "text-neon-yellow" },
    { icon: Medal, label: "Level", value: level, color: "text-neon-green" },
    { icon: Trophy, label: "Rank", value: "#-" , color: "text-neon-blue" },
    { icon: Calendar, label: "Joined", value: userData?.createdAt ? formatDate(userData.createdAt) : "-", color: "text-gray-400" },
  ]

  return (
    <WalletGuard>
      <div className="min-h-screen pt-24 pb-12">
        <div className="page-container">
          <div className="glass-card p-6 sm:p-8 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center text-3xl font-bold text-white shrink-0">
                {(wallet?.name || "U").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-heading font-bold text-white mb-1">
                  {wallet?.name || "Player"}
                </h1>
                <p className="text-gray-400 text-sm flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4 text-neon-blue" />
                  {userData?.walletId ? `ID: ${userData.walletId.slice(0, 8)}...` : "Wallet secured"}
                </p>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Level {level}</span>
                    <span>{xp % 100}/{xpForNext} XP</span>
                  </div>
                  <div className="progress-bar w-full max-w-xs">
                    <div className="progress-fill" style={{ width: `${xpProgress * 100}%` }} />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleLock} className="btn-secondary text-sm flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Lock
                </button>
                <button onClick={handleReset} className="btn-secondary text-sm flex items-center gap-2 text-red-400">
                  <LogOut className="w-4 h-4" /> Reset
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className="glass-card p-4 text-center"
              >
                <div className={`text-2xl font-heading font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* 728×90 AD */}
          <div className="mb-6">
            <AdBanner adKey="728x90-dashboard-mid" height={90} width={728} className="flex justify-center" />
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto">
            {[
              { key: "overview", label: "Overview", icon: User },
              { key: "scratch", label: "Scratch Card", icon: Zap },
              { key: "themes", label: "Themes", icon: Palette },
              { key: "region", label: "Region", icon: Globe },
              { key: "referral", label: "Referral", icon: Users },
              { key: "history", label: "History", icon: Clock },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 whitespace-nowrap ${
                    activeTab === tab.key
                      ? "bg-neon-blue/20 text-neon-blue border border-neon-blue/30"
                      : "glass text-gray-400 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h3 className="text-lg font-heading font-bold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-neon-green" /> Security
                </h3>
                <div className="space-y-3">
                  {[
                    ["Encryption", "AES-256-GCM"],
                    ["Key Derivation", "PBKDF2 (100k rounds)"],
                    ["Storage", "Browser Local (encrypted)"],
                    ["Recovery", "12-word phrase"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <span className="text-sm text-gray-300">{label}</span>
                      <span className="text-sm text-gray-400">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-lg font-heading font-bold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-neon-purple" /> Quick Actions
                </h3>
                <div className="space-y-3">
                  {[
                    { icon: Gift, label: "Browse Rewards", desc: "Spend your points", href: "/rewards" },
                    { icon: Trophy, label: "Leaderboard", desc: "See top players", href: "/leaderboard" },
                    { icon: Sparkles, label: "Challenges", desc: "Daily tasks", href: "/challenges" },
                    { icon: TrendingUp, label: "Earn Points", desc: "Read articles", href: "/news" },
                  ].map((action) => (
                    <button
                      key={action.label}
                      onClick={() => router.push(action.href)}
                      className="w-full flex items-center gap-4 p-3 rounded-xl glass hover:bg-white/10 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center">
                        <action.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-semibold text-white">{action.label}</div>
                        <div className="text-xs text-gray-400">{action.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "themes" && (
            <ThemeSection walletId={wallet?.walletId} userData={userData} />
          )}

          {activeTab === "scratch" && (
            <div className="glass-card p-8 text-center max-w-md mx-auto">
              <h3 className="text-xl font-heading font-bold text-white mb-2 flex items-center justify-center gap-2">
                <Zap className="w-5 h-5 text-neon-yellow" /> Scratch Card
              </h3>
              <p className="text-gray-500 text-xs mb-6">
                Tap to scratch and win points
              </p>
              <div
                className={`w-48 h-48 mx-auto rounded-2xl flex items-center justify-center cursor-pointer ${
                  revealed
                    ? scratchResult?.tier === "gold"
                      ? "bg-gradient-to-br from-yellow-500/20 to-amber-400/20 border-2 border-yellow-500/40"
                      : scratchResult?.tier === "silver"
                        ? "bg-gradient-to-br from-gray-300/20 to-gray-100/20 border-2 border-gray-300/40"
                        : "bg-gradient-to-br from-amber-700/20 to-amber-500/20 border-2 border-amber-500/40"
                    : "bg-gradient-to-br from-neon-pink/20 to-neon-purple/20 border-2 border-white/10 hover:border-neon-pink/50"
                }`}
                onClick={handleScratch}
              >
                {scratching ? (
                  <div className="animate-spin w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full" />
                ) : revealed ? (
                  <div className="text-center">
                    <div className="text-4xl mb-1">{scratchResult?.emoji}</div>
                    <div className="text-4xl font-heading font-bold text-neon-green">+{scratchResult?.points}</div>
                    <div className="text-xs text-gray-400 mt-1">{scratchResult?.tier === "gold" ? "🥇 Gold" : scratchResult?.tier === "silver" ? "🥈 Silver" : "🥉 Bronze"}</div>
                  </div>
                ) : (
                  <div className="text-center">
                    <Zap className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                    <div className="text-sm text-gray-500">Tap to scratch</div>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-4">
                {userData?.scratchCardsPlayed || 0} cards played
              </p>
            </div>
          )}

          {activeTab === "referral" && (
            <ReferralSection walletId={wallet?.walletId} />
          )}

          {activeTab === "region" && (
            <RegionSection walletId={wallet?.walletId} />
          )}

          {activeTab === "history" && (
            <div className="glass-card p-6 max-w-2xl mx-auto">
              <h3 className="text-lg font-heading font-bold text-white mb-4">Point History</h3>
              {history.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No activity yet. Start earning points!</p>
              ) : (
                <div className="space-y-2">
                  {history.map((tx: any) => (
                    <div key={tx.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                      <div>
                        <div className="text-sm text-white">{tx.reason}</div>
                        <div className="text-xs text-gray-500">{formatDate(tx.createdAt)}</div>
                      </div>
                      <div className={`text-sm font-mono font-bold ${tx.amount > 0 ? "text-neon-green" : "text-red-400"}`}>
                        {tx.amount > 0 ? "+" : ""}{tx.amount}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 320×50 mobile banner (hidden on desktop) */}
          <div className="block sm:hidden mb-6">
            <AdBanner adKey="320x50-dashboard-mobile" height={50} width={320} className="flex justify-center" />
          </div>

          {/* 468×60 AD */}
          <div className="mb-6">
            <AdBanner adKey="468x60-dashboard-bottom" height={60} width={468} className="flex justify-center" />
          </div>
        </div>
      </div>
    </WalletGuard>
  )
}

function ThemeSection({ walletId, userData }: { walletId?: string; userData: any }) {
  const { theme, applyTheme } = useTheme()

  const themes = [
    { id: "default" as const, name: "Default Dark", desc: "Classic dark theme", gradient: "from-gray-800 to-gray-900" },
    { id: "gta-neon" as const, name: "GTA Neon", desc: "Vice City neon glow", gradient: "from-neon-pink to-neon-purple" },
  ]

  return (
    <div className="glass-card p-6 max-w-2xl mx-auto">
      <h3 className="text-lg font-heading font-bold text-white mb-4 flex items-center gap-2">
        <Palette className="w-5 h-5 text-neon-purple" /> My Themes
      </h3>
      <p className="text-gray-400 text-sm mb-6">
        Unlock themes by redeeming theme packs from the rewards store. Your active theme applies across the whole site.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {themes.map((t) => {
          const unlocked = t.id === "default" || userData?.theme === t.id
          return (
            <div
              key={t.id}
              className={`p-4 rounded-xl border cursor-pointer ${
                theme === t.id
                  ? "border-neon-blue/40 bg-neon-blue/10 shadow-lg shadow-neon-blue/10"
                  : unlocked
                    ? "border-white/10 glass hover:border-white/30"
                    : "border-white/5 bg-white/5 opacity-40 cursor-not-allowed"
              }`}
              onClick={() => { if (unlocked) applyTheme(walletId!, t.id); else toast("Redeem the theme pack from Rewards first!") }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${t.gradient} flex items-center justify-center`}>
                  <Palette className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.desc}</div>
                </div>
              </div>
              {!unlocked && <div className="text-xs text-neon-yellow flex items-center gap-1"><Lock className="w-3 h-3" /> Locked</div>}
              {theme === t.id && <div className="text-xs text-neon-blue">Active</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ReferralSection({ walletId }: { walletId?: string }) {
  const [refInfo, setRefInfo] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!walletId) return
    setLoading(true)
    fetch(`/api/referral?walletId=${walletId}`)
      .then(r => r.json())
      .then(data => setRefInfo(data))
      .catch(() => toast.error("Failed to load referral"))
      .finally(() => setLoading(false))
  }, [walletId])

  const copyLink = () => {
    if (!refInfo?.link) return
    navigator.clipboard.writeText(refInfo.link)
    setCopied(true)
    toast.success("Referral link copied!")
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="glass-card p-6 max-w-2xl mx-auto text-center">
        <div className="animate-pulse text-gray-500">Loading referral info...</div>
      </div>
    )
  }

  return (
    <div className="glass-card p-6 max-w-2xl mx-auto">
      <h3 className="text-lg font-heading font-bold text-white mb-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-neon-green" /> Refer Friends
      </h3>
      <p className="text-gray-400 text-sm mb-6">
        Share your referral link or code. When a friend signs up and redeems, you get <span className="text-neon-green font-bold">10 points + 20%</span> of their reward cost!
      </p>

      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Your Referral Link</label>
          <div className="flex items-center gap-2">
            <input readOnly value={refInfo?.link || ""} className="input-field flex-1 text-xs font-mono" onClick={(e) => (e.target as HTMLInputElement).select()} />
            <button onClick={copyLink} className="btn-glass !p-3 rounded-xl shrink-0">
              {copied ? <Check className="w-4 h-4 text-neon-green" /> : <Copy className="w-4 h-4 text-gray-400" />}
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Or share your code</label>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
            <span className="flex-1 text-center text-2xl font-bold font-mono tracking-widest text-neon-green">{refInfo?.code || "------"}</span>
            <button onClick={copyLink} className="btn-glass !p-2 rounded-xl">
              <Copy className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-white/5 text-center">
            <div className="text-xl font-bold text-white mb-1">{refInfo?.referralCount || 0}</div>
            <div className="text-xs text-gray-500">Friends Referred</div>
          </div>
          <div className="p-3 rounded-xl bg-white/5 text-center">
            <div className="text-xl font-bold text-neon-green mb-1">{refInfo?.bonusEarned || 0}</div>
            <div className="text-xs text-gray-500">Bonus Points Earned</div>
          </div>
        </div>
      </div>
    </div>
  )
}

const REGIONS = [
  { id: "", label: "Auto (Detect IP)" },
  { id: "india", label: "India" },
  { id: "usa", label: "USA" },
  { id: "uk", label: "United Kingdom" },
  { id: "germany", label: "Germany" },
  { id: "france", label: "France" },
  { id: "australia", label: "Australia" },
  { id: "brazil", label: "Brazil" },
  { id: "russia", label: "Russia" },
  { id: "japan", label: "Japan" },
  { id: "canada", label: "Canada" },
  { id: "uae", label: "UAE" },
  { id: "south-africa", label: "South Africa" },
  { id: "mexico", label: "Mexico" },
  { id: "spain", label: "Spain" },
  { id: "italy", label: "Italy" },
]

function RegionSection({ walletId }: { walletId?: string }) {
  const [selected, setSelected] = useState("")
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!walletId) { setLoading(false); return }
    fetch(`/api/users/${walletId}`)
      .then(r => r.json())
      .then(data => setSelected((data as any).region || ""))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [walletId])

  const handleSelect = async (regionId: string) => {
    if (!walletId) return toast.error("Connect wallet first")
    setSaving(true)
    try {
      const res = await fetch("/api/users/region", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletId, region: regionId }),
      })
      if (res.ok) {
        setSelected(regionId)
        toast.success("Region updated! Codes will be generated for the mapped country.")
      }
    } catch {}
    setSaving(false)
  }

  if (loading) {
    return <div className="glass-card p-6 max-w-2xl mx-auto text-center"><div className="animate-pulse text-gray-500">Loading...</div></div>
  }

  return (
    <div className="glass-card p-6 max-w-2xl mx-auto">
      <h3 className="text-lg font-heading font-bold text-white mb-2 flex items-center gap-2">
        <Globe className="w-5 h-5 text-neon-blue" /> Code Region
      </h3>
      <p className="text-gray-400 text-sm mb-6">
        Select your region. When you redeem a reward, the coupon code will be generated for the mapped country.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {REGIONS.map((region) => {
          const isActive = selected === region.id
          return (
            <button
              key={region.id}
              onClick={() => handleSelect(region.id)}
              disabled={saving}
              className={`p-3 rounded-xl text-left transition-all ${
                isActive
                  ? "bg-neon-blue/20 border border-neon-blue/30"
                  : "glass border border-transparent hover:border-white/10"
              }`}
            >
              <div className={`text-sm font-semibold ${isActive ? "text-neon-blue" : "text-white"}`}>{region.label}</div>
            </button>
          )
        })}
      </div>
      {saving && <div className="text-xs text-gray-500 mt-3 text-center">Saving...</div>}
    </div>
  )
}
