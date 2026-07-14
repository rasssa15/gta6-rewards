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
          const isMobile = window.innerWidth < 1024
          if (isMobile) {
            const inline = document.createElement("script")
            inline.text = "atOptions={'key':'bec02ef6fdbfe5fe80e15c3c4f9f4b58','format':'iframe','height':250,'width':300,'params':{}};"
            el.appendChild(inline)
            const invoke = document.createElement("script")
            invoke.src = "https://evidentbummerhike.com/bec02ef6fdbfe5fe80e15c3c4f9f4b58/invoke.js"
            el.appendChild(invoke)
          } else {
            const d = document.createElement("div")
            d.id = "container-f301214e059ca70b56b447bf6850594e"
            el.appendChild(d)
            const s = document.createElement("script")
            s.async = true
            s.setAttribute("data-cfasync", "false")
            s.src = "https://evidentbummerhike.com/f301214e059ca70b56b447bf6850594e/invoke.js"
            el.appendChild(s)
          }
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
        <div ref={containerRef} style={{ minHeight: 250 }} />
      </div>
    </div>
  )
}
