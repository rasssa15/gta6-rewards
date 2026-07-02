"use client"
import { useEffect, useRef } from "react"

const ADS: { id: string; src: string; container: string; height: number }[] = [
  { id: "ad-skyscraper", src: "https://evidentbummerhike.com/14c436b60c41a18bb9f73c3ebfe72863/invoke.js", container: "container-14c436b60c41a18bb9f73c3ebfe72863", height: 600 },
  { id: "ad-small-skyscraper", src: "https://evidentbummerhike.com/0eda691a2c2d80a93114f023a3d7f665/invoke.js", container: "container-0eda691a2c2d80a93114f023a3d7f665", height: 300 },
]

function AdUnit({ ad }: { ad: typeof ADS[0] }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const d = document.createElement("div")
    d.id = ad.container
    el.appendChild(d)
    const s = document.createElement("script")
    s.async = true
    s.setAttribute("data-cfasync", "false")
    s.src = ad.src
    el.appendChild(s)
  }, [ad])
  return <div ref={ref} style={{ minHeight: ad.height }} />
}

export default function SidebarAds() {
  return (
    <aside className="hidden lg:flex flex-col gap-4 w-[180px] shrink-0">
      <div className="sticky top-24 flex flex-col gap-4">
        {ADS.map(ad => (
          <div key={ad.id} className="glass-card overflow-hidden flex justify-center p-1">
            <div className="w-[160px] flex items-center justify-center">
              <AdUnit ad={ad} />
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}