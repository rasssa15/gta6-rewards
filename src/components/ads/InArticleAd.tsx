"use client"
import { useEffect, useRef, useState } from "react"

export function InArticleAd() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (loaded) return
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
      { rootMargin: "200px 0px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loaded])

  return (
    <div className="flex justify-center my-6">
      <div className="w-full max-w-[728px] flex justify-center">
        <div ref={containerRef} style={{ minHeight: 90 }} />
      </div>
    </div>
  )
}
