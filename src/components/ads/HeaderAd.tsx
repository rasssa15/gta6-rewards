"use client"
import { LazyAd } from "./LazyAd"

export function HeaderAd() {
  return (
    <div className="relative z-10 border-b border-white/5">
      <div className="flex justify-center py-2 bg-black/30">
        <LazyAd type="responsive" minHeight={90} />
      </div>
    </div>
  )
}
