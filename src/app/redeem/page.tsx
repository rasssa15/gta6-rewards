"use client"
import { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Gift, ArrowLeft, Check, AlertCircle, Loader2, Copy, Star, ArrowRight, Image as ImageIcon, Clock, Eye, Shield, Globe, ExternalLink, Trophy, Calendar } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useWallet } from "@/components/providers/WalletProvider"
import { useTheme } from "@/components/ThemeProvider"
import toast from "react-hot-toast"

const PLATFORMS = [
  { id: "steam", label: "Steam", icon: "🎮", hours: 24, desc: "24 hours" },
  { id: "epic", label: "Epic Games", icon: "🟣", hours: 24, desc: "24 hours" },
  { id: "nintendo", label: "Nintendo Switch", icon: "🕹️", hours: 12, desc: "12 hours" },
  { id: "xbox", label: "Xbox", icon: "🎯", hours: 72, desc: "3 days" },
  { id: "playstation", label: "PlayStation", icon: "🔵", hours: 72, desc: "3 days" },
]

function RedeemContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { walletId, points, refresh } = useWallet()
  const [reward, setReward] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [redeeming, setRedeeming] = useState(false)
  const [success, setSuccess] = useState(false)
  const [isWallpaperPack, setIsWallpaperPack] = useState(false)
  const [isThemePack, setIsThemePack] = useState(false)
  const [themeName, setThemeName] = useState<string | null>(null)
  const { applyTheme } = useTheme()

  const [selectedPlatform, setSelectedPlatform] = useState("steam")
  const [redemptionId, setRedemptionId] = useState<string | null>(null)
  const [codeCountry, setCodeCountry] = useState("")
  const [platformLabel, setPlatformLabel] = useState("")
  const [timerDisplay, setTimerDisplay] = useState("")
  const [popupClicked, setPopupClicked] = useState(0)
  const [popupRequired, setPopupRequired] = useState(20)
  const [timerReady, setTimerReady] = useState(false)
  const [dailyLoginDone, setDailyLoginDone] = useState(false)
  const [dailyLoginCount, setDailyLoginCount] = useState(0)
  const [challengesDone, setChallengesDone] = useState(false)
  const [challengesCompleted, setChallengesCompleted] = useState(0)
  const [codeReady, setCodeReady] = useState(false)
  const [codeGenerated, setCodeGenerated] = useState(false)
  const [codeViewed, setCodeViewed] = useState(false)
  const [viewingCode, setViewingCode] = useState(false)
  const [revealedCode, setRevealedCode] = useState<string | null>(null)

  const pollRef = useRef<NodeJS.Timeout | null>(null)

  const rewardId = searchParams.get("reward")

  useEffect(() => {
    if (!rewardId) { setLoading(false); return }
    fetch("/api/rewards")
      .then(r => r.json())
      .then((rewards) => {
        const found = rewards.find((r: any) => r.id === rewardId)
        setReward(found)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [rewardId])

  useEffect(() => {
    if (!redemptionId || !walletId) return
    const poll = async () => {
      try {
        const res = await fetch(`/api/redeem/code-status?redemptionId=${redemptionId}&walletId=${walletId}`)
        const data = await res.json()
        setTimerDisplay(data.timeRemaining !== undefined ? formatTimer(data.timeRemaining) : "")
        setTimerReady(data.timerReady || false)
        setPopupClicked(data.popupAdsClicked || 0)
        setPopupRequired(data.popupAdsRequired || 20)
        setDailyLoginCount(data.dailyLoginCount || 0)
        setDailyLoginDone(data.dailyLoginDone || false)
        setChallengesCompleted(data.challengesCompleted || 0)
        setChallengesDone(data.challengesDone || false)
        setCodeReady(data.codeReady || false)
        setCodeGenerated(data.codeGenerated || false)
        setCodeViewed(data.codeViewed || false)
        setCodeCountry(data.codeCountry || "")
        setPlatformLabel(data.platform || "steam")
      } catch {}
    }
    poll()
    pollRef.current = setInterval(poll, 1000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [redemptionId, walletId])

  const handleRedeem = async () => {
    if (!walletId) return toast.error("Connect your wallet first")
    if (!reward) return
    setRedeeming(true)
    try {
      const res = await fetch("/api/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletId, rewardId: reward.id, platform: selectedPlatform }),
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess(true)
        if (data.isWallpaperPack) setIsWallpaperPack(true)
        if (data.isThemePack && walletId) {
          setIsThemePack(true)
          setThemeName(data.themeName || "gta-neon")
          applyTheme(walletId, data.themeName || "gta-neon")
        }
        if (data.isCoupon && data.redemption) {
          setRedemptionId(data.redemption.id)
          setCodeCountry(data.redemption.codeCountry || "")
          setPlatformLabel(selectedPlatform)
        }
        toast.success("Redemption successful!")
        refresh()
      } else {
        toast.error(data.error || "Redemption failed")
      }
    } catch {
      toast.error("Redemption failed")
    }
    setRedeeming(false)
  }

  const handlePopupAdClick = async () => {
    if (!redemptionId || !walletId) return
    window.open("https://www.effectivecpmnetwork.com/ferya5qq?key=0fdf4c14f0056af80dff7d2b13c4d1ee", "_blank", "width=400,height=300")
    try {
      const res = await fetch("/api/redeem/ad-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ redemptionId, walletId }),
      })
      const data = await res.json()
      if (res.ok) {
        setPopupClicked(data.popupAdsClicked)
        toast.success(`Popup ad clicked! (${data.popupAdsClicked}/${data.popupAdsRequired})`)
      }
    } catch {}
  }

  const handleViewCode = async () => {
    if (!redemptionId || !walletId) return
    setViewingCode(true)
    try {
      const res = await fetch("/api/redeem/view-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ redemptionId, walletId }),
      })
      const data = await res.json()
      if (res.ok) {
        setRevealedCode(data.code)
        setCodeViewed(true)
        toast.success("Code revealed! This is a one-time view.")
      } else if (data.alreadyViewed) {
        toast.error("This code was already viewed and is no longer available.")
        setCodeViewed(true)
      } else {
        toast.error(data.error || "Failed to reveal code")
      }
    } catch {}
    setViewingCode(false)
  }

  const platform = PLATFORMS.find(p => p.id === platformLabel)
  const platformHours = PLATFORMS.find(p => p.id === selectedPlatform)?.hours || 24

  if (loading) {
    return <div className="min-h-screen pt-24 pb-16 flex items-center justify-center"><Loader2 className="w-8 h-8 text-neon-blue animate-spin" /></div>
  }

  if (!rewardId || !reward) {
    return (
      <div className="min-h-screen pt-24 pb-16 text-center">
        <Gift className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h1 className="text-2xl text-gray-400 font-semibold mb-2">Reward not found</h1>
        <button onClick={() => router.push("/rewards")} className="text-neon-blue hover:underline">Browse rewards</button>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-10 text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-neon-green/20 to-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-neon-green" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-white mb-2">Redemption Successful!</h2>
          <p className="text-gray-400 mb-4">{reward.name}</p>

          {isThemePack ? (
            <div className="mt-4 p-5 rounded-xl bg-gradient-to-br from-neon-pink/10 to-neon-blue/5 border border-neon-pink/30">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neon-pink to-neon-purple flex items-center justify-center mx-auto mb-3 shadow-lg shadow-neon-pink/20">
                <Star className="w-6 h-6 text-white" />
              </div>
              <p className="text-gray-300 text-sm font-semibold mb-1">GTA Neon Theme Activated!</p>
              <p className="text-gray-500 text-xs">Your entire site now has the GTA Vice City neon look</p>
              <button onClick={() => router.push("/dashboard")} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-neon-pink to-neon-purple text-white font-semibold mt-4">
                <Star className="w-4 h-4" /> Go to Dashboard
              </button>
            </div>
          ) : isWallpaperPack ? (
            <div className="mt-4 p-5 rounded-xl bg-gradient-to-br from-neon-pink/10 to-neon-blue/5 border border-neon-pink/30">
              <ImageIcon className="w-10 h-10 text-neon-pink mx-auto mb-3" />
              <p className="text-gray-300 text-sm mb-3">Your 100 GTA Wallpaper Pack is ready!</p>
              <button onClick={() => router.push("/wallpapers")} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-neon-pink to-neon-purple text-white font-semibold">
                <ImageIcon className="w-4 h-4" /> View & Download Wallpapers
              </button>
            </div>
          ) : codeViewed && revealedCode ? (
            <div className="mt-4 space-y-4">
              <div className="p-5 rounded-xl bg-gradient-to-br from-neon-green/10 to-emerald-500/5 border border-neon-green/30">
                <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">{platform?.label} Code for {codeCountry}</p>
                <div className="flex items-center gap-2 justify-center">
                  <code className="text-xl font-mono font-bold text-neon-green tracking-wider select-all bg-black/30 px-4 py-2 rounded-lg">{revealedCode}</code>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-red-400" />
                  <p className="text-sm text-red-400 font-semibold">One-Time View Only</p>
                </div>
                <p className="text-xs text-red-400/70">This code has been destroyed and cannot be viewed again. Copy it now.</p>
              </div>
              <button onClick={() => { navigator.clipboard.writeText(revealedCode!); toast.success("Code copied!") }} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                <Copy className="w-4 h-4" /> Copy Code
              </button>
            </div>
          ) : codeReady && !codeViewed ? (
            <div className="mt-4 space-y-4">
              <div className="p-5 rounded-xl bg-gradient-to-br from-neon-green/10 to-emerald-500/5 border border-neon-green/30">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-neon-green/20 to-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                  <Gift className="w-7 h-7 text-neon-green" />
                </div>
                <p className="text-gray-300 text-sm font-semibold mb-1">Your {platform?.label} Code is Ready!</p>
                <p className="text-gray-500 text-xs mb-4">Region: {codeCountry}</p>
                <button onClick={handleViewCode} disabled={viewingCode} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                  {viewingCode ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                  {viewingCode ? "Revealing..." : "View Code"}
                </button>
                <p className="text-xs text-yellow-500 mt-3 flex items-center justify-center gap-1">
                  <Shield className="w-3 h-3" /> One-time view only
                </p>
              </div>
            </div>
          ) : codeGenerated && codeViewed && !revealedCode ? (
            <div className="mt-4 p-5 rounded-xl bg-red-500/10 border border-red-500/20">
              <Shield className="w-5 h-5 text-red-400 mx-auto mb-2" />
              <p className="text-sm text-red-400 font-semibold">Code Already Viewed</p>
              <p className="text-xs text-red-400/70">This code was already viewed once and has been permanently destroyed.</p>
            </div>
          ) : redemptionId ? (
            <div className="mt-4 space-y-4">
              <div className="p-5 rounded-xl bg-gradient-to-br from-neon-purple/10 to-neon-blue/5 border border-neon-purple/30">
                <div className="flex items-center justify-center gap-2 mb-3">
                  {platform?.icon && platform.icon.startsWith("/") ? <img src={platform.icon} alt={platform.label || ""} className="w-8 h-8" /> : <span className="text-2xl">{platform?.icon}</span>}
                  <span className="text-sm text-gray-300 font-semibold">{platform?.label} Code</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-neon-purple" />
                  <span className="text-sm text-gray-300">Region: <span className="text-neon-purple font-bold">{codeCountry}</span></span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-neon-yellow" />
                  <span className="text-sm text-gray-300">Timer: <span className="text-neon-yellow font-mono font-bold">{timerDisplay}</span></span>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Popup Ads</span>
                    <span className={popupClicked >= popupRequired ? "text-neon-green" : "text-gray-400"}>{popupClicked}/{popupRequired}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-neon-purple to-neon-blue transition-all" style={{ width: `${Math.min(100, (popupClicked / popupRequired) * 100)}%` }} />
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Daily Login</span>
                    <span className={dailyLoginDone ? "text-neon-green" : "text-gray-400"}>{dailyLoginCount}/1</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-neon-green to-emerald-500 transition-all" style={{ width: `${Math.min(100, dailyLoginCount)}%` }} />
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Trophy className="w-3 h-3" /> Challenges</span>
                    <span className={challengesDone ? "text-neon-green" : "text-gray-400"}>{challengesCompleted}/5</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-neon-pink to-neon-purple transition-all" style={{ width: `${Math.min(100, (challengesCompleted / 5) * 100)}%` }} />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button onClick={handlePopupAdClick} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 border border-neon-purple/30 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:from-neon-purple/30 hover:to-neon-blue/30 transition-all">
                    <ExternalLink className="w-4 h-4" /> Click Popup Ad ({popupClicked}/{popupRequired})
                  </button>
                  <Link href="/challenges" className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm font-semibold flex items-center justify-center gap-2 hover:text-white transition-all">
                    <Trophy className="w-4 h-4" /> Complete Challenges ({challengesCompleted}/5)
                  </Link>
                </div>
                <p className="text-xs text-gray-500 mt-2">Complete all requirements to unlock your code</p>
              </div>
              <button onClick={() => router.push("/dashboard")} className="w-full py-3 rounded-xl bg-white/5 text-gray-400 hover:text-white transition-all text-sm">
                Back to Dashboard
              </button>
            </div>
          ) : (
            <p className="text-gray-400 mb-6">Your reward will be processed soon.</p>
          )}

          {!redemptionId && !codeReady && !codeGenerated && !isThemePack && !isWallpaperPack && (
            <button onClick={() => router.push("/dashboard")} className="btn-primary mt-6 w-full">Go to Dashboard</button>
          )}
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="page-container max-w-md">
        <button onClick={() => router.push("/rewards")} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Rewards
        </button>

        <div className="glass-card overflow-hidden">
          <div className="relative h-48 bg-gradient-to-br from-neon-green/10 to-neon-blue/10">
            {reward.image && (
              <img src={reward.image} alt={reward.name} className="w-full h-full object-cover opacity-40" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#070710] via-transparent to-transparent" />
            <div className="absolute bottom-4 left-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-green/30 to-neon-blue/20 flex items-center justify-center border border-neon-green/30">
                <Gift className="w-8 h-8 text-neon-green" />
              </div>
            </div>
          </div>
          <div className="p-6">
            <h1 className="text-2xl font-heading font-bold text-white mb-2">{reward.name}</h1>
            <p className="text-gray-400 mb-6">{reward.description}</p>

            {!walletId ? (
              <div className="glass-card p-6 text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 flex items-center justify-center mx-auto mb-3">
                  <AlertCircle className="w-7 h-7 text-neon-purple" />
                </div>
                <h3 className="text-white font-semibold mb-2">Wallet Required</h3>
                <p className="text-gray-400 text-sm mb-5">Create or unlock your wallet to redeem rewards.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/wallet/create" className="btn-primary !py-2.5 !px-6 text-sm font-semibold">Create Wallet</Link>
                  <Link href="/wallet/login" className="btn-secondary !py-2.5 !px-6 text-sm font-semibold">Unlock Wallet</Link>
                </div>
              </div>
            ) : reward.stock < 1 ? (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 mb-6">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <p className="text-sm text-red-500 font-semibold">Sold Out</p>
              </div>
            ) : points < reward.pointsCost ? (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 mb-6">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <p className="text-sm text-red-500">You need {reward.pointsCost - points} more points</p>
              </div>
            ) : (
              <div className="mb-6">
                <p className="text-sm text-gray-400 mb-3 text-center">Select platform for your code:</p>
                <div className="grid grid-cols-2 gap-2">
                  {PLATFORMS.map((p) => {
                    const isActive = selectedPlatform === p.id
                    return (
                      <button key={p.id} onClick={() => setSelectedPlatform(p.id)} className={`p-3 rounded-xl text-left transition-all ${isActive ? "bg-neon-blue/20 border border-neon-blue/30" : "glass border border-transparent hover:border-white/10"}`}>
                        {p.icon && typeof p.icon === "string" && p.icon.startsWith("/") ? <img src={p.icon} alt={p.label} className="w-7 h-7 mb-0.5" /> : <div className="text-lg mb-0.5">{p.icon}</div>}
                        <div className={`text-sm font-semibold ${isActive ? "text-neon-blue" : "text-white"}`}>{p.label}</div>
                        <div className="text-xs text-gray-500">{p.desc}</div>
                      </button>
                    )
                  })}
                </div>
                <div className="mt-3 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                  <p className="text-xs text-yellow-500 text-center">
                    After redeeming: wait {platformHours}h timer + 20 popup ads + daily login + 5 challenges
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-8 mb-6 p-4 rounded-xl bg-white/5">
              <div className="text-center">
                <div className="text-2xl font-heading font-bold text-neon-yellow">{reward.pointsCost}</div>
                <div className="text-xs text-gray-500 mt-1">Points</div>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center">
                <div className={`text-2xl font-heading font-bold ${reward.stock > 0 ? "text-neon-green" : "text-red-400"}`}>{reward.stock}</div>
                <div className="text-xs text-gray-500 mt-1">Stock</div>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center">
                <div className="text-2xl font-heading font-bold text-white">{points.toLocaleString()}</div>
                <div className="text-xs text-gray-500 mt-1">Your Points</div>
              </div>
            </div>

            <button onClick={handleRedeem} disabled={!walletId || reward.stock < 1 || points < reward.pointsCost || redeeming} className="btn-primary w-full py-4 flex items-center justify-center gap-2 disabled:opacity-50 text-base">
              {redeeming ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Gift className="w-5 h-5" /> Redeem Now <ArrowRight className="w-5 h-5" /></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function formatTimer(ms: number): string {
  if (ms <= 0) return "00:00:00"
  const days = Math.floor(ms / 86400000)
  const h = Math.floor((ms % 86400000) / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  if (days > 0) return `${days}d ${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
}

export default function RedeemPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 flex items-center justify-center"><div className="animate-pulse text-gray-400">Loading...</div></div>}>
      <RedeemContent />
    </Suspense>
  )
}
