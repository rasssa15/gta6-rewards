"use client"
import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Newspaper, Clock } from "lucide-react"

export function SidebarAd() {
  const skyscraperRef = useRef<HTMLDivElement>(null)
  const smallRef = useRef<HTMLDivElement>(null)
  const [skyLoaded, setSkyLoaded] = useState(false)
  const [smallLoaded, setSmallLoaded] = useState(false)

  useEffect(() => {
    const el = skyscraperRef.current
    if (!el || skyLoaded) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const inline = document.createElement("script")
          inline.text = `atOptions={'key':'14c436bda0b1d02724d0618980143ce5','format':'iframe','height':600,'width':160,'params':{}};`
          el.appendChild(inline)
          const invoke = document.createElement("script")
          invoke.src = "https://evidentbummerhike.com/14c436bda0b1d02724d0618980143ce5/invoke.js"
          el.appendChild(invoke)
          setSkyLoaded(true)
          observer.disconnect()
        }
      },
      { rootMargin: "200px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [skyLoaded])

  useEffect(() => {
    const el = smallRef.current
    if (!el || smallLoaded) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const inline = document.createElement("script")
          inline.text = `atOptions={'key':'0eda691a40adbc5636d43af20fdda82d','format':'iframe','height':300,'width':160,'params':{}};`
          el.appendChild(inline)
          const invoke = document.createElement("script")
          invoke.src = "https://evidentbummerhike.com/0eda691a40adbc5636d43af20fdda82d/invoke.js"
          el.appendChild(invoke)
          setSmallLoaded(true)
          observer.disconnect()
        }
      },
      { rootMargin: "200px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [smallLoaded])

  return (
    <aside className="hidden lg:flex flex-col gap-4 w-[180px] shrink-0">
      <div className="sticky top-24 flex flex-col gap-4">
        <div className="glass-card overflow-hidden flex justify-center p-1">
          <div ref={skyscraperRef} className="w-[160px]" style={{ minHeight: 600 }} />
        </div>
        <div className="glass-card overflow-hidden flex justify-center p-1">
          <div ref={smallRef} className="w-[160px]" style={{ minHeight: 300 }} />
        </div>
        <div className="glass-card p-3">
          <div className="flex items-center gap-2 mb-2">
            <Newspaper className="w-3 h-3 text-neon-blue" />
            <span className="text-xs text-white font-semibold">Latest News</span>
          </div>
          <div className="space-y-2">
            {["GTA 6 Leak", "Rockstar Update", "PS5 Pro Specs"].map((title) => (
              <Link key={title} href="/news" className="block text-[11px] text-gray-400 hover:text-neon-blue truncate">
                {title}
              </Link>
            ))}
          </div>
        </div>
        <div className="glass-card p-3">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-3 h-3 text-neon-pink" />
            <span className="text-xs text-white font-semibold">GTA 6 Countdown</span>
          </div>
          <p className="text-[10px] text-gray-500">Release date TBA</p>
        </div>
      </div>
    </aside>
  )
}
