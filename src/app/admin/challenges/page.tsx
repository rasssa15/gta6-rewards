"use client"
import { useState, useEffect } from "react"
import { Sparkles, Plus, Trash2 } from "lucide-react"
import { motion } from "framer-motion"
import toast from "react-hot-toast"

export default function AdminChallengesPage() {
  const [challenges, setChallenges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title: "", description: "", type: "read_articles", target: 5, pointReward: 10, xpReward: 30, key: "" })

  const load = () => {
    fetch("/api/challenges")
      .then(r => r.json())
      .then(setChallenges)
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleAdd = async () => {
    if (!form.title) return toast.error("Title required")
    const key = form.key || form.title.toLowerCase().replace(/\s+/g, "_")
    try {
      await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, key, active: true }),
      })
      toast.success("Challenge created!")
      setForm({ title: "", description: "", type: "read_articles", target: 5, pointReward: 10, xpReward: 30, key: "" })
      load()
    } catch {}
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="page-container">
        <div className="flex items-center gap-3 mb-8">
          <Sparkles className="w-6 h-6 text-neon-yellow" />
          <h1 className="text-2xl font-heading font-bold text-white">Challenges</h1>
        </div>

        <div className="glass-card p-6 mb-8">
          <h2 className="text-lg font-heading font-bold text-white mb-4">Add Challenge</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Title</label>
              <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Key</label>
              <input type="text" value={form.key} onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))} className="input-field" placeholder="read_3_articles" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Type</label>
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="input-field">
                <option value="read_articles">Read Articles</option>
                <option value="earn_points">Earn Points</option>
                <option value="daily_visit">Daily Visit</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Target</label>
              <input type="number" value={form.target} onChange={(e) => setForm((f) => ({ ...f, target: parseInt(e.target.value) || 1 }))} className="input-field" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Point Reward</label>
              <input type="number" value={form.pointReward} onChange={(e) => setForm((f) => ({ ...f, pointReward: parseInt(e.target.value) || 0 }))} className="input-field" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">XP Reward</label>
              <input type="number" value={form.xpReward} onChange={(e) => setForm((f) => ({ ...f, xpReward: parseInt(e.target.value) || 0 }))} className="input-field" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm text-gray-400 mb-1 block">Description</label>
              <input type="text" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="input-field" />
            </div>
          </div>
          <button onClick={handleAdd} className="btn-primary text-sm mt-4 !px-6 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Challenge
          </button>
        </div>

        <div className="space-y-2">
          {challenges.map((c) => (
            <motion.div key={c.id} className="glass-card p-4 flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold">{c.title}</h3>
                <p className="text-sm text-gray-400">{c.description}</p>
                <div className="flex gap-3 mt-1 text-xs text-gray-500">
                  <span className="text-neon-green">{c.pointReward} pts</span>
                  <span className="text-neon-purple">{c.xpReward} XP</span>
                  <span>Target: {c.target}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
