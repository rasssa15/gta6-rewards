"use client"
import { useState, useEffect } from "react"
import { Users, Search, Star, Medal } from "lucide-react"
import { motion } from "framer-motion"
import { formatNumber } from "@/lib/utils"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/users?limit=100")
      .then(r => r.json())
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="page-container">
        <div className="flex items-center gap-3 mb-8">
          <Users className="w-6 h-6 text-neon-blue" />
          <h1 className="text-2xl font-heading font-bold text-white">Users</h1>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="glass-card p-4 space-y-2">
                <div className="h-5 w-48 skeleton" />
                <div className="h-4 w-24 skeleton" />
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left text-xs text-gray-500 font-semibold uppercase tracking-wider p-4">Name</th>
                    <th className="text-left text-xs text-gray-500 font-semibold uppercase tracking-wider p-4">Wallet ID</th>
                    <th className="text-right text-xs text-gray-500 font-semibold uppercase tracking-wider p-4">Points</th>
                    <th className="text-right text-xs text-gray-500 font-semibold uppercase tracking-wider p-4">Level</th>
                    <th className="text-right text-xs text-gray-500 font-semibold uppercase tracking-wider p-4">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, i) => (
                    <motion.tr
                      key={user.walletId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-all"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center">
                            <span className="text-xs font-bold text-white">{user.name?.charAt(0) || "U"}</span>
                          </div>
                          <span className="text-sm text-white font-medium">{user.name || "Anonymous"}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-400 font-mono">{user.walletId?.slice(0, 12)}...</td>
                      <td className="p-4 text-sm text-neon-yellow font-mono text-right font-bold">{formatNumber(user.points)}</td>
                      <td className="p-4 text-sm text-neon-green font-mono text-right">{user.level}</td>
                      <td className="p-4 text-sm text-gray-500 text-right">{new Date(user.createdAt).toLocaleDateString()}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            {users.length === 0 && (
              <p className="text-gray-500 text-center py-8">No users yet</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
