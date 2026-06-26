"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ShieldAlert, Eye, EyeOff } from "lucide-react"
import toast from "react-hot-toast"

export default function AdminLoginPage() {
  const [password, setPassword] = useState("")
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) return
    setLoading(true)
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        sessionStorage.setItem("admin_auth", "true")
        toast.success("Welcome, admin!")
        router.push("/admin")
      } else {
        toast.error("Wrong password")
      }
    } catch {
      toast.error("Auth failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
      <div className="glass-card p-8 w-full max-w-sm mx-4">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mb-4">
            <ShieldAlert className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-heading font-bold text-white">Admin Access</h1>
          <p className="text-sm text-gray-400 mt-1">Enter admin password to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Admin password"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-neon-blue/50 pr-10"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? "Checking..." : "Enter Admin Panel"}
          </button>
        </form>
      </div>
    </div>
  )
}
