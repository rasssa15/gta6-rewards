"use client"
import { LazyAd } from "./LazyAd"

export function BottomBannerAd() {
  return (
    <div className="relative z-10 border-t border-white/5 bg-black/30">
      <div className="page-container py-3 flex flex-col items-center gap-3">
        <LazyAd type="banner-468x60" />
        <div className="hidden lg:flex justify-center w-full">
          <LazyAd type="medium-rectangle" minHeight={250} />
        </div>
        <div className="lg:hidden w-full flex justify-center">
          <LazyAd type="banner-320x50" />
        </div>
      </div>
    </div>
  )
}
