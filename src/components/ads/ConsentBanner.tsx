"use client"
import { useState, useEffect } from "react"
import { X, Cookie } from "lucide-react"

export function ConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem("gdpr_consent")
    if (!consent) setVisible(true)
  }, [])

  const accept = () => {
    localStorage.setItem("gdpr_consent", "accepted")
    setVisible(false)
  }

  const reject = () => {
    localStorage.setItem("gdpr_consent", "rejected")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4">
      <div className="max-w-3xl mx-auto glass-card p-4 flex flex-col sm:flex-row items-center gap-4 border border-white/10">
        <div className="flex items-center gap-3 flex-1">
          <Cookie className="w-6 h-6 text-neon-green shrink-0" />
          <p className="text-sm text-gray-300">
            This site uses cookies and similar technologies to serve ads and improve your experience.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={reject} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white border border-white/10 hover:border-white/30 transition-all">
            Reject
          </button>
          <button onClick={accept} className="px-4 py-2 rounded-lg text-sm font-semibold bg-neon-green text-black hover:bg-neon-green/90 transition-all">
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
