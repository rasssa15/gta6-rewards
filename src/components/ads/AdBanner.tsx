"use client"
import { useEffect, useId, useRef } from "react"

interface AdBannerProps {
  adKey: string
  height: number
  width: number
  format?: string
  className?: string
}

export function AdBanner({ adKey, className }: AdBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const reactId = useId().replace(/[:]/g, "")

  useEffect(() => {
    if (!containerRef.current) return
    const container = containerRef.current
    container.innerHTML = ""

    const div = document.createElement("div")
    div.id = `container-${adKey}-${reactId}`
    container.appendChild(div)

    const invokeScript = document.createElement("script")
    invokeScript.async = true
    invokeScript.setAttribute("data-cfasync", "false")
    invokeScript.src = `https://evidentbummerhike.com/${adKey}/invoke.js`
    container.appendChild(invokeScript)

    return () => {
      container.innerHTML = ""
    }
  }, [adKey, reactId])

  return <div ref={containerRef} className={className} />
}
