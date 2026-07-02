"use client"
import { useEffect, useRef } from "react"

const POPUP_URL = "https://www.effectivecpmnetwork.com/ferya5qq?key=0fdf4c14f0056af80dff7d2b13c4d1ee"

export function AutoPopupAd() {
  const firedRef = useRef(false)

  useEffect(() => {
    if (firedRef.current) return
    firedRef.current = true
    const timer = setTimeout(() => {
      try {
        window.open(POPUP_URL, "_blank")
      } catch {}
    }, 15000)
    return () => clearTimeout(timer)
  }, [])

  return null
}
