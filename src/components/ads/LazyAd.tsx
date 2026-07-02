"use client"
import { useEffect, useRef, useState } from "react"

interface LazyAdProps {
  type: "responsive" | "skyscraper" | "small-skyscraper"
  minHeight?: number
  className?: string
}

interface AdConfig {
  key: string
  containerId: string
  script: string
  height?: number
  width?: number
}

const AD_CONFIG: Record<string, AdConfig> = {
  responsive: {
    key: "f301214e059ca70b56b447bf6850594e",
    containerId: "container-f301214e059ca70b56b447bf6850594e",
    script: "https://evidentbummerhike.com/f301214e059ca70b56b447bf6850594e/invoke.js",
  },
  skyscraper: {
    key: "14c436bda0b1d02724d0618980143ce5",
    height: 600,
    width: 160,
    script: "https://evidentbummerhike.com/14c436bda0b1d02724d0618980143ce5/invoke.js",
    containerId: "container-14c436bda0b1d02724d0618980143ce5",
  },
  "small-skyscraper": {
    key: "0eda691a40adbc5636d43af20fdda82d",
    height: 300,
    width: 160,
    script: "https://evidentbummerhike.com/0eda691a40adbc5636d43af20fdda82d/invoke.js",
    containerId: "container-0eda691a40adbc5636d43af20fdda82d",
  },
}

export function LazyAd({ type, minHeight, className }: LazyAdProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: "200px 0px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!visible || loaded) return
    const container = containerRef.current
    if (!container) return

    const config = AD_CONFIG[type]
    if (!config) return

    if (type === "responsive") {
      const script = document.createElement("script")
      script.async = true
      script.setAttribute("data-cfasync", "false")
      script.src = config.script
      container.appendChild(script)
      const div = document.createElement("div")
      div.id = config.containerId
      container.appendChild(div)
    } else {
      const inline = document.createElement("script")
      inline.text = `atOptions={'key':'${config.key}','format':'iframe','height':${config.height},'width':${config.width},'params':{}};`
      container.appendChild(inline)
      const invoke = document.createElement("script")
      invoke.src = config.script
      container.appendChild(invoke)
    }

    setLoaded(true)
    return () => { container.innerHTML = "" }
  }, [visible, loaded, type])

  const height = minHeight || (type === "skyscraper" ? 600 : type === "small-skyscraper" ? 300 : 90)

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ minHeight: height, minWidth: type !== "responsive" ? 160 : undefined }}
    />
  )
}
