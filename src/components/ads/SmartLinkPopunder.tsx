"use client"
import { useEffect, useRef } from "react"

const SMART_LINK = "https://www.effectivecpmnetwork.com/ferya5qq?key=0fdf4c14f0056af80dff7d2b13c4d1ee"

export function SmartLinkPopunder() {
  const firedRef = useRef(false)

  useEffect(() => {
    if (firedRef.current) return
    if (sessionStorage.getItem("ht_popunder_fired")) return

    const handler = () => {
      if (firedRef.current) return
      firedRef.current = true
      sessionStorage.setItem("ht_popunder_fired", "1")
      try {
        const win = window.open(SMART_LINK, "_blank")
        if (win) {
          try { win.blur() } catch {}
          setTimeout(() => { try { window.focus() } catch {} }, 100)
        }
      } catch {}
    }

    document.addEventListener("click", handler, { once: true })
    return () => document.removeEventListener("click", handler)
  }, [])

  return null
}
