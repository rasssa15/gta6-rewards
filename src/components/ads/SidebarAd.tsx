"use client"
import { useEffect, useRef, useState } from "react"
import { AtOptionsAd } from "./AtOptionsAd"

export function SidebarAd() {
  const skyRef = useRef<HTMLDivElement>(null)
  const [skyLoaded, setSkyLoaded] = useState(false)

  useEffect(() => {
    const el = skyRef.current
    if (!el || skyLoaded) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const inline = document.createElement("script")
          inline.text = "atOptions={'key':'14c436bda0b1d02724d0618980143ce5','format':'iframe','height':600,'width':160,'params':{}};"
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

  return (
    <aside className="hidden lg:flex flex-col gap-4 w-[180px] shrink-0">
      <div className="sticky top-24 flex flex-col gap-4">
        <div className="glass-card overflow-hidden flex justify-center p-1">
          <div ref={skyRef} className="w-[160px]" style={{ minHeight: 600 }} />
        </div>
        <div className="glass-card overflow-hidden flex justify-center p-1">
          <div className="flex justify-center">
            <AtOptionsAd adKey="bec02ef6fdbfe5fe80e15c3c4f9f4b58" width={300} height={250} />
          </div>
        </div>
      </div>
    </aside>
  )
}
