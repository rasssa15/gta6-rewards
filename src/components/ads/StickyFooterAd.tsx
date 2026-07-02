"use client"
import { useEffect, useRef, useState } from "react"
import { X } from "lucide-react"

export function StickyFooterAd() {
  const [dismissed, setDismissed] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const hidden = sessionStorage.getItem("sticky_ad_dismissed")
    if (hidden) { setDismissed(true); return }
    const isMobile = window.innerWidth < 1024
    if (!isMobile) { setDismissed(true); return }
  }, [])

  useEffect(() => {
    if (dismissed || loaded) return
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const d = document.createElement("div")
          d.id = "container-f301214e059ca70b56b447bf6850594e"
          el.appendChild(d)
          const s = document.createElement("script")
          s.async = true
          s.setAttribute("data-cfasync", "false")
          s.src = "https://evidentbummerhike.com/f301214e059ca70b56b447bf6850594e/invoke.js"
          el.appendChild(s)
          setLoaded(true)
          observer.disconnect()
        }
      },
      { rootMargin: "100px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [dismissed, loaded])

  const handleDismiss = () => {
    setDismissed(true)
    sessionStorage.setItem("sticky_ad_dismissed", "1")
  }

  if (dismissed) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[90] lg:hidden">
      <div className="relative bg-[#070710]/95 border-t border-white/10 backdrop-blur-xl">
        <button
          onClick={handleDismiss}
          className="absolute -top-5 right-2 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <X className="w-3 h-3 text-white" />
        </button>
        <div ref={containerRef} className="flex justify-center py-1" style={{ minHeight: 50 }} />
      </div>
    </div>
  )
}
