"use client"
import { useEffect, useRef } from "react"

interface AdBannerProps {
  adKey: string
  height: number
  width: number
  format?: string
  className?: string
}

export function AdBanner({ adKey, height, width, format = "iframe", className }: AdBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const container = containerRef.current
    container.innerHTML = ""

    const inlineScript = document.createElement("script")
    inlineScript.text = `
      atOptions = {
        'key': '${adKey}',
        'format': '${format}',
        'height': ${height},
        'width': ${width},
        'params': {}
      };
    `
    container.appendChild(inlineScript)

    const invokeScript = document.createElement("script")
    invokeScript.src = `https://www.highperformanceformat.com/${adKey}/invoke.js`
    invokeScript.async = true
    container.appendChild(invokeScript)

    return () => {
      container.innerHTML = ""
    }
  }, [adKey, height, width, format])

  return <div ref={containerRef} className={className} />
}
