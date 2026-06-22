"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  User, Zap, Trophy, Gift, Sparkles, Flame, BookOpen, Play, Users, 
  ChevronRight, Clock, Coins, Award, PartyPopper, Share2, Copy, CheckCircle,
  BarChart3, Target
} from "lucide-react"
import toast from "react-hot-toast"
import { ScratchCardComponent } from "@/components/scratch/ScratchCard"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userData, setUserData] = useState<any>(null)
  const [scratchCards, setScratchCards] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login")
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      fetch("/api/auth/me")
        .then((r) => r.json())
        .then((d) => { if (d.data) setUserData(d.data) })
        .catch(() => {})
      fetch("/api/scratch-cards")
        .then((r) => r.json())
        .then((d) => { if (d.data) setScratchCards(d.data) })
        .catch(() => {})
    }
  }, [session])

  if (status === "loading" || !userData) {
    return (
      <div className="min-h-screen pt-20 pb-12">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton h-32 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const stats = [
    { icon: Coins, label: "Points", value: userData.points.toLocaleString(), color: "text-neon-yellow", bg: "bg-neon-yellow/10" },
    { icon: Trophy, label: "Level", value: `${userData.level} - ${userData.rank}`, color: "text-neon-blue", bg: "bg-neon-blue/10" },
    { icon: Flame, label: "Day Streak", value: userData.streak.toString(), color: "text-neon-orange", bg: "bg-neon-orange/10" },
    { icon: BookOpen, label: "Articles Read", value: userData.articlesRead.toString(), color: "text-neon-green", bg: "bg-neon-green/10" },
    { icon: Play, label: "Ads Watched", value: userData.adsWatched.toString(), color: "text-neon-pink", bg: "bg-neon-pink/10" },
    { icon: Sparkles, label: "Scratch Cards", value: userData.scratchCardsOpened.toString(), color: "text-neon-purple", bg: "bg-neon-purple/10" },
  ]

  const referralLink = userData.referralCode 
    ? `${window.location.origin}/auth/register?ref=${userData.referralCode}`
    : ""

  const copyReferral = () => {
    navigator.clipboard.writeText(referralLink)
    toast.success("Referral link copied!")
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="page-container">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 sm:p-8 mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center text-3xl font-bold text-white shrink-0">
              {userData.name?.[0] || userData.username?.[0] || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-heading font-bold text-white truncate">
                  {userData.name || userData.username || "Player"}
                </h1>
                <span className="badge-neon text-xs">{userData.rank}</span>
              </div>
              <p className="text-gray-400 text-sm mb-3">@{userData.username}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-neon-yellow">
                  <Coins className="w-4 h-4" />
                  <span className="font-bold">{userData.points.toLocaleString()}</span>
                  <span className="text-gray-500">points</span>
                </div>
                <div className="flex items-center gap-1 text-neon-blue">
                  <Award className="w-4 h-4" />
                  <span>Level {userData.level}</span>
                </div>
                <div className="flex items-center gap-1 text-neon-orange">
                  <Flame className="w-4 h-4" />
                  <span>{userData.streak} day streak</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={copyReferral} className="btn-secondary text-sm flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Refer
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-4 text-center"
            >
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mx-auto mb-2`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className={`text-lg font-heading font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-xs text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: "overview", label: "Overview", icon: BarChart3 },
            { id: "scratch", label: "Scratch Cards", icon: Sparkles },
            { id: "referrals", label: "Referrals", icon: Users },
            { id: "history", label: "History", icon: Clock },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-neon-pink to-neon-purple text-white"
                  : "glass text-gray-300 hover:text-white"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
              <h3 className="text-lg font-heading font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-neon-green" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Browse News", desc: "Read and earn points", href: "/news", icon: BookOpen },
                  { label: "Watch Ads", desc: "Earn 2 points + scratch card", href: "/rewards", icon: Play },
                  { label: "Complete Challenges", desc: "Daily challenges await", href: "/challenges", icon: Trophy },
                  { label: "Redeem Rewards", desc: "Spend your points", href: "/rewards", icon: Gift },
                ].map((action) => (
                  <button
                    key={action.label}
                    onClick={() => router.push(action.href)}
                    className="w-full flex items-center gap-4 p-3 rounded-xl glass hover:bg-white/10 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center">
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-semibold text-white">{action.label}</div>
                      <div className="text-xs text-gray-400">{action.desc}</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
              <h3 className="text-lg font-heading font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-neon-purple" />
                Referral Program
              </h3>
              {referralLink ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-400">
                    Share your referral link and earn <span className="text-neon-yellow font-bold">50 points</span> for each friend who joins!
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={referralLink}
                      readOnly
                      className="input-field text-sm flex-1"
                    />
                    <button onClick={copyReferral} className="btn-primary !px-3">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const text = `Join GTA 6 Rewards and start earning! Use my referral link: ${referralLink}`
                        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank")
                      }}
                      className="btn-secondary text-sm flex-1 flex items-center justify-center gap-2"
                    >
                      Share on Twitter
                    </button>
                    <button
                      onClick={() => {
                        const text = `Join GTA 6 Rewards and start earning! ${referralLink}`
                        navigator.clipboard.writeText(text)
                        toast.success("Copied for sharing!")
                      }}
                      className="btn-secondary text-sm flex-1 flex items-center justify-center gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      Share Anywhere
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 text-sm">Loading referral info...</p>
              )}
            </motion.div>
          </div>
        )}

        {activeTab === "scratch" && (
          <div>
            <div className="glass-card p-6 mb-6">
              <h3 className="text-lg font-heading font-bold text-white mb-2">Your Scratch Cards</h3>
              <p className="text-gray-400 text-sm mb-6">
                You have <span className="text-neon-yellow font-bold">{scratchCards.length}</span> scratch cards available. 
                Watch ads to earn more!
              </p>
              {scratchCards.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {scratchCards.map((card) => (
                    <ScratchCardComponent key={card.id} card={card} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Sparkles className="w-12 h-12 mx-auto text-gray-500 mb-4" />
                  <p className="text-gray-400">No scratch cards yet</p>
                  <p className="text-gray-500 text-sm">Watch rewarded ads to earn scratch cards!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "referrals" && (
          <div className="glass-card p-6">
            <h3 className="text-lg font-heading font-bold text-white mb-4">Referral History</h3>
            <p className="text-gray-400 text-sm mb-4">
              Refer friends and earn 50 points each. Track your referrals here.
            </p>
            <div className="text-center py-8 text-gray-500 text-sm">
              <Users className="w-8 h-8 mx-auto mb-2" />
              Share your referral link to start tracking
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="glass-card p-6">
            <h3 className="text-lg font-heading font-bold text-white mb-4">Recent Activity</h3>
            {userData.pointTransactions?.length > 0 ? (
              <div className="divide-y divide-white/5">
                {userData.pointTransactions.slice(0, 20).map((tx: any) => (
                  <div key={tx.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        tx.type === "earned" ? "bg-neon-green/10" : "bg-red-500/10"
                      }`}>
                        {tx.type === "earned" ? (
                          <PartyPopper className="w-4 h-4 text-neon-green" />
                        ) : (
                          <span className="text-red-400 text-sm">-</span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-white">{tx.note || tx.source}</p>
                        <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${
                      tx.points > 0 ? "text-neon-green" : "text-red-400"
                    }`}>
                      {tx.points > 0 ? "+" : ""}{tx.points}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-8">No activity yet. Start earning points!</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
