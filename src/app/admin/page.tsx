"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  BarChart3, Users, Newspaper, Gift, Settings, Sparkles, TrendingUp, 
  Activity, DollarSign, Award, Zap, Shield, UserCog, Database, 
  RefreshCw, ChevronRight, Clock, Eye, CheckCircle, XCircle
} from "lucide-react"
import { PuterAIAdmin } from "@/components/admin/PuterAIAdmin"

type Tab = "overview" | "users" | "articles" | "rewards" | "ai" | "settings" | "analytics"

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>("overview")
  const [analytics, setAnalytics] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [articles, setArticles] = useState<any[]>([])
  const [rewards, setRewards] = useState<any[]>([])

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login")
    else if (session && (session.user as any).role !== "admin") router.push("/")
  }, [status, session, router])

  useEffect(() => {
    if (!session || (session.user as any).role !== "admin") return
    fetch("/api/admin/analytics").then(r => r.json()).then(d => { if (d.data) setAnalytics(d.data) }).catch(() => {})
    fetch("/api/admin/users?limit=5").then(r => r.json()).then(d => { if (d.data) setUsers(d.data.users) }).catch(() => {})
    fetch("/api/admin/articles").then(r => r.json()).then(d => { if (d.data) setArticles(d.data) }).catch(() => {})
    fetch("/api/admin/rewards").then(r => r.json()).then(d => { if (d.data) setRewards(d.data) }).catch(() => {})
  }, [session])

  if (status === "loading" || !analytics) {
    return (
      <div className="min-h-screen pt-20 pb-12">
        <div className="page-container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
          </div>
        </div>
      </div>
    )
  }

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "users", label: "Users", icon: Users },
    { id: "articles", label: "Articles", icon: Newspaper },
    { id: "rewards", label: "Rewards", icon: Gift },
    { id: "ai", label: "AI Generator", icon: Sparkles },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  const overview = analytics?.overview || {}

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="page-container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-neon-pink" />
            <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white">Admin Panel</h1>
          </div>
          <p className="text-gray-400">Manage your GTA 6 Rewards platform</p>
        </motion.div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-all ${
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

        {activeTab === "overview" && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { icon: Users, label: "Total Users", value: overview.users?.toLocaleString() || "0", color: "text-neon-blue", bg: "bg-neon-blue/10" },
                { icon: Newspaper, label: "Articles", value: overview.articles?.toLocaleString() || "0", color: "text-neon-green", bg: "bg-neon-green/10" },
                { icon: Gift, label: "Redemptions", value: overview.redemptions?.toLocaleString() || "0", color: "text-neon-yellow", bg: "bg-neon-yellow/10" },
                { icon: Activity, label: "Daily Active", value: overview.dailyActive?.toLocaleString() || "0", color: "text-neon-orange", bg: "bg-neon-orange/10" },
                { icon: DollarSign, label: "Points Earned", value: (overview.totalPointsEarned || 0).toLocaleString(), color: "text-neon-green", bg: "bg-neon-green/10" },
                { icon: Eye, label: "Ads Watched", value: (overview.totalAdsWatched || 0).toLocaleString(), color: "text-neon-pink", bg: "bg-neon-pink/10" },
                { icon: Award, label: "Scratch Cards", value: overview.scratchCards?.toLocaleString() || "0", color: "text-neon-purple", bg: "bg-neon-purple/10" },
                { icon: Zap, label: "Achievements", value: overview.achievements?.toLocaleString() || "0", color: "text-neon-yellow", bg: "bg-neon-yellow/10" },
              ].map((stat) => (
                <div key={stat.label} className={`glass-card p-4 ${stat.bg}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    <span className="text-xs text-gray-400">{stat.label}</span>
                  </div>
                  <div className={`text-2xl font-heading font-bold ${stat.color}`}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {analytics?.topUsers && (
                <div className="glass-card p-6">
                  <h3 className="text-lg font-heading font-bold text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-neon-blue" /> Top Users
                  </h3>
                  <div className="space-y-3">
                    {analytics.topUsers.map((user: any, i: number) => (
                      <div key={user.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
                        <span className="text-sm font-bold text-gray-500 w-6">#{i + 1}</span>
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center text-xs font-bold text-white">
                          {user.name?.[0] || user.username?.[0] || "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{user.name || user.username}</p>
                          <p className="text-xs text-gray-400">Level {user.level} {user.rank}</p>
                        </div>
                        <span className="text-sm font-bold text-neon-yellow">{user.points.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analytics?.topArticles && (
                <div className="glass-card p-6">
                  <h3 className="text-lg font-heading font-bold text-white mb-4 flex items-center gap-2">
                    <Newspaper className="w-5 h-5 text-neon-green" /> Top Articles
                  </h3>
                  <div className="space-y-3">
                    {analytics.topArticles.map((article: any) => (
                      <div key={article.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors">
                        <div className="flex-1 min-w-0 mr-4">
                          <p className="text-sm text-white truncate">{article.title}</p>
                          <p className="text-xs text-gray-400">{article.category}</p>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-400">
                          <Eye className="w-3 h-3" />
                          {article.viewCount}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "analytics" && (
          <div className="glass-card p-6">
            <h3 className="text-lg font-heading font-bold text-white mb-4">Detailed Analytics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: "Total Users", value: overview.users, icon: Users },
                { label: "Total Articles", value: overview.articles, icon: Newspaper },
                { label: "Total Rewards", value: overview.rewards, icon: Gift },
                { label: "Redemptions", value: overview.redemptions, icon: CheckCircle },
                { label: "Referrals", value: overview.referrals, icon: Users },
                { label: "Daily Logins", value: overview.dailyLogins, icon: Activity },
                { label: "Scratch Cards", value: overview.scratchCards, icon: Sparkles },
                { label: "Achievements", value: overview.achievements, icon: Award },
                { label: "Daily Active", value: overview.dailyActive, icon: TrendingUp },
                { label: "Points Earned", value: (overview.totalPointsEarned || 0).toLocaleString(), icon: DollarSign },
                { label: "Active Points", value: (overview.circulatingPoints || 0).toLocaleString(), icon: Zap },
                { label: "Redemption Rate", value: overview.totalPointsEarned > 0 ? `${((overview.redemptions * 100) / Math.max(1, overview.users)).toFixed(1)}%` : "0%", icon: TrendingUp },
              ].map((item) => (
                <div key={item.label} className="glass-card p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </div>
                  <div className="text-xl font-heading font-bold text-white">{item.value || 0}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="glass-card overflow-hidden">
            <div className="p-6 border-b border-white/5">
              <h3 className="text-lg font-heading font-bold text-white">User Management</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-gray-400">
                    <th className="text-left p-4 font-medium">User</th>
                    <th className="text-left p-4 font-medium">Email</th>
                    <th className="text-left p-4 font-medium">Role</th>
                    <th className="text-right p-4 font-medium">Points</th>
                    <th className="text-right p-4 font-medium">Level</th>
                    <th className="text-right p-4 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((user: any) => (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center text-xs font-bold text-white">
                            {user.name?.[0] || user.username?.[0] || "U"}
                          </div>
                          <span className="text-white font-medium">{user.name || user.username}</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-400">{user.email}</td>
                      <td className="p-4">
                        <span className={`badge ${user.role === "admin" ? "badge-neon" : "badge-blue"}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4 text-right text-neon-yellow font-bold">{user.points?.toLocaleString()}</td>
                      <td className="p-4 text-right text-white">{user.level}</td>
                      <td className="p-4 text-right text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "articles" && (
          <div className="glass-card overflow-hidden">
            <div className="p-6 border-b border-white/5">
              <h3 className="text-lg font-heading font-bold text-white">Article Management</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-gray-400">
                    <th className="text-left p-4 font-medium">Title</th>
                    <th className="text-left p-4 font-medium">Category</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-right p-4 font-medium">Views</th>
                    <th className="text-right p-4 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {articles.map((article: any) => (
                    <tr key={article.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <span className="text-white">{article.title}</span>
                      </td>
                      <td className="p-4">
                        <span className="badge-blue text-xs">{article.category}</span>
                      </td>
                      <td className="p-4">
                        <span className={`badge ${article.status === "published" ? "badge-green" : "badge-blue"}`}>
                          {article.status}
                        </span>
                      </td>
                      <td className="p-4 text-right text-gray-400">{article.viewCount}</td>
                      <td className="p-4 text-right text-gray-400">
                        {new Date(article.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "rewards" && (
          <div className="glass-card overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-lg font-heading font-bold text-white">Reward Management</h3>
              <button className="btn-primary text-sm">Add Reward</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-gray-400">
                    <th className="text-left p-4 font-medium">Name</th>
                    <th className="text-left p-4 font-medium">Type</th>
                    <th className="text-right p-4 font-medium">Cost</th>
                    <th className="text-right p-4 font-medium">Value</th>
                    <th className="text-right p-4 font-medium">Stock</th>
                    <th className="text-left p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {rewards.map((reward: any) => (
                    <tr key={reward.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 text-white">{reward.name}</td>
                      <td className="p-4">
                        <span className="badge-blue text-xs">{reward.type}</span>
                      </td>
                      <td className="p-4 text-right text-neon-yellow font-bold">{reward.cost}</td>
                      <td className="p-4 text-right text-white">${reward.value}</td>
                      <td className="p-4 text-right text-gray-400">{reward.stock}</td>
                      <td className="p-4">
                        <span className={`badge ${reward.status === "active" ? "badge-green" : "badge-blue"}`}>
                          {reward.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "ai" && (
          <PuterAIAdmin />
        )}

        {activeTab === "settings" && (
          <div className="glass-card p-6">
            <h3 className="text-lg font-heading font-bold text-white mb-4">Platform Settings</h3>
            <p className="text-gray-400 text-sm mb-6">Configure platform settings and point values.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: "Daily Login Points", value: "5" },
                { label: "Article Read Points", value: "1" },
                { label: "Ad Watch Points", value: "2" },
                { label: "Referral Points", value: "50" },
                { label: "Scratch Card Min", value: "1" },
                { label: "Scratch Card Max", value: "50" },
              ].map((setting) => (
                <div key={setting.label} className="glass-card p-4">
                  <label className="text-sm text-gray-400 block mb-2">{setting.label}</label>
                  <input
                    type="text"
                    defaultValue={setting.value}
                    className="input-field text-sm"
                    readOnly
                  />
                </div>
              ))}
            </div>
            <button className="btn-primary mt-6" onClick={() => {}}>
              Save Settings
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
