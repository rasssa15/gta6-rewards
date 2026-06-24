"use client"
import { useState, useEffect } from "react"
import { Gift, Plus, Edit2, Trash2 } from "lucide-react"
import { motion } from "framer-motion"
import toast from "react-hot-toast"

export default function AdminRewardsPage() {
  const [rewards, setRewards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: "", description: "", pointsCost: 100, stock: 10, category: "gift-card", image: "" })
  const [editingId, setEditingId] = useState<string | null>(null)

  const load = () => {
    fetch("/api/rewards")
      .then(r => r.json())
      .then(setRewards)
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSave = async () => {
    if (!form.name) return toast.error("Name required")
    try {
      const url = editingId ? `/api/rewards?id=${editingId}` : "/api/rewards"
      const method = editingId ? "PUT" : "POST"
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      if (res.ok) {
        toast.success(editingId ? "Updated!" : "Created!")
        setForm({ name: "", description: "", pointsCost: 100, stock: 10, category: "gift-card", image: "" })
        setEditingId(null)
        load()
      }
    } catch {}
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this reward?")) return
    try {
      await fetch(`/api/rewards?id=${id}`, { method: "DELETE" })
      toast.success("Deleted!")
      load()
    } catch {}
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="page-container">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Gift className="w-6 h-6 text-neon-green" />
            <h1 className="text-2xl font-heading font-bold text-white">Rewards</h1>
          </div>
        </div>

        <div className="glass-card p-6 mb-8">
          <h2 className="text-lg font-heading font-bold text-white mb-4">{editingId ? "Edit" : "Add"} Reward</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Description</label>
              <input type="text" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Points Cost</label>
              <input type="number" value={form.pointsCost} onChange={(e) => setForm((f) => ({ ...f, pointsCost: parseInt(e.target.value) || 0 }))} className="input-field" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Stock</label>
              <input type="number" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: parseInt(e.target.value) || 0 }))} className="input-field" />
            </div>
          </div>
          <button onClick={handleSave} className="btn-primary text-sm mt-4 !px-6">
            {editingId ? "Update" : "Add Reward"}
          </button>
          {editingId && (
            <button onClick={() => { setEditingId(null); setForm({ name: "", description: "", pointsCost: 100, stock: 10, category: "gift-card", image: "" }) }} className="btn-secondary text-sm mt-4 ml-2 !px-6">
              Cancel
            </button>
          )}
        </div>

        <div className="space-y-2">
          {rewards.map((r) => (
            <motion.div key={r.id} className="glass-card p-4 flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold">{r.name}</h3>
                <p className="text-sm text-gray-400">{r.description}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span className="text-neon-yellow font-mono">{r.pointsCost} pts</span>
                  <span>Stock: {r.stock}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditingId(r.id); setForm(r) }} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(r.id)} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-red-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
