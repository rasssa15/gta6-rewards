"use client"
import { useEffect, useRef, useState } from "react"

interface AtOptionsAdProps {
  adKey: string
  width: number
  height: number
  className?: string
  minHeight?: number
}

export function AtOptionsAd({ adKey, width, height, className, minHeight }: AtOptionsAdProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (loaded) return
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const inline = document.createElement("script")
          inline.text = `atOptions={'key':'${adKey}','format':'iframe','height':${height},'width':${width},'params':{}};`
          el.appendChild(inline)
          const invoke = document.createElement("script")
          invoke.src = `https://evidentbummerhike.com/${adKey}/invoke.js`
          el.appendChild(invoke)
          setLoaded(true)
          observer.disconnect()
        }
      },
      { rootMargin: "200px 0px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loaded, adKey, height, width])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ minHeight: minHeight || height, minWidth: width }}
    />
  )
}
