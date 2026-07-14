"use client"
import { useEffect, useRef } from "react"
import { AtOptionsAd } from "@/components/ads/AtOptionsAd"

function AdUnit({ adKey, width, height }: { adKey: string; width: number; height: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const inline = document.createElement("script")
    inline.text = `atOptions={'key':'${adKey}','format':'iframe','height':${height},'width':${width},'params':{}};`
    el.appendChild(inline)
    const invoke = document.createElement("script")
    invoke.src = `https://evidentbummerhike.com/${adKey}/invoke.js`
    el.appendChild(invoke)
  }, [adKey, height, width])
  return <div ref={ref} style={{ minHeight: height, minWidth: width }} />
}

export default function SidebarAds() {
  return (
    <aside className="hidden lg:flex flex-col gap-4 w-[180px] shrink-0">
      <div className="sticky top-24 flex flex-col gap-4">
        <div className="glass-card overflow-hidden flex justify-center p-1">
          <div className="w-[160px] flex items-center justify-center">
            <AdUnit adKey="14c436bda0b1d02724d0618980143ce5" width={160} height={600} />
          </div>
        </div>
        <div className="glass-card overflow-hidden flex justify-center p-1">
          <div className="w-[160px] flex items-center justify-center">
            <AtOptionsAd adKey="bec02ef6fdbfe5fe80e15c3c4f9f4b58" width={300} height={250} />
          </div>
        </div>
        <div className="glass-card overflow-hidden flex justify-center p-1">
          <div className="flex items-center justify-center">
            <AtOptionsAd adKey="bec02ef6fdbfe5fe80e15c3c4f9f4b58" width={300} height={250} />
          </div>
        </div>
        <div className="glass-card overflow-hidden flex justify-center p-1">
          <div className="flex items-center justify-center">
            <AtOptionsAd adKey="0eda691a40adbc5636d43af20fdda82d" width={160} height={300} />
          </div>
        </div>
      </div>
    </aside>
  )
}
