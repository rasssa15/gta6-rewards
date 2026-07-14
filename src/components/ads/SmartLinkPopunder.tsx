"use client"
import { useEffect } from "react"

export function SmartLinkPopunder() {
  useEffect(() => {
    const t = setTimeout(() => {
      window.open("https://www.effectivecpmnetwork.com/ferya5qq?key=0fdf4c14f0056af80dff7d2b13c4d1ee", "_blank")
    }, 5000)
    const t2 = setTimeout(() => {
      window.open("https://evidentbummerhike.com/kvm8xim06x?key=f9e1ac35f26663912d75f263e7113dc5", "_blank")
    }, 12000)
    return () => { clearTimeout(t); clearTimeout(t2) }
  }, [])
  return null
}
