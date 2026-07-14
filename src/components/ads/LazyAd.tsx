"use client"
import { useEffect, useRef, useState } from "react"

interface LazyAdProps {
  type: "responsive" | "skyscraper" | "medium-rectangle" | "leaderboard" | "banner-320x50" | "banner-160x300" | "banner-468x60"
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
  "medium-rectangle": {
    key: "bec02ef6fdbfe5fe80e15c3c4f9f4b58",
    height: 250,
    width: 300,
    script: "https://evidentbummerhike.com/bec02ef6fdbfe5fe80e15c3c4f9f4b58/invoke.js",
    containerId: "container-bec02ef6fdbfe5fe80e15c3c4f9f4b58",
  },
  leaderboard: {
    key: "7e7419c72404cab7787c27dfdac31321",
    height: 90,
    width: 728,
    script: "https://evidentbummerhike.com/7e7419c72404cab7787c27dfdac31321/invoke.js",
    containerId: "container-7e7419c72404cab7787c27dfdac31321",
  },
  "banner-320x50": {
    key: "a32d05859c7cdc4b19c45ea2746367ad",
    height: 50,
    width: 320,
    script: "https://evidentbummerhike.com/a32d05859c7cdc4b19c45ea2746367ad/invoke.js",
    containerId: "container-a32d05859c7cdc4b19c45ea2746367ad",
  },
  "banner-160x300": {
    key: "0eda691a40adbc5636d43af20fdda82d",
    height: 300,
    width: 160,
    script: "https://evidentbummerhike.com/0eda691a40adbc5636d43af20fdda82d/invoke.js",
    containerId: "container-0eda691a40adbc5636d43af20fdda82d",
  },
  "banner-468x60": {
    key: "ab7ca47a4d4e9c1d01cb3978051a9800",
    height: 60,
    width: 468,
    script: "https://evidentbummerhike.com/ab7ca47a4d4e9c1d01cb3978051a9800/invoke.js",
    containerId: "container-ab7ca47a4d4e9c1d01cb3978051a9800",
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

    if (type === "medium-rectangle" || type === "leaderboard" || type === "skyscraper" || type === "banner-320x50" || type === "banner-160x300" || type === "banner-468x60") {
      const inline = document.createElement("script")
      inline.text = `atOptions={'key':'${config.key}','format':'iframe','height':${config.height},'width':${config.width},'params':{}};`
      container.appendChild(inline)
      const invoke = document.createElement("script")
      invoke.src = config.script
      container.appendChild(invoke)
    } else {
      const div = document.createElement("div")
      div.id = config.containerId
      container.appendChild(div)
      const script = document.createElement("script")
      script.async = true
      script.setAttribute("data-cfasync", "false")
      script.src = config.script
      container.appendChild(script)
    }

    setLoaded(true)
    return () => { container.innerHTML = "" }
  }, [visible, loaded, type])

  const h = minHeight || (type === "skyscraper" ? 600 : type === "medium-rectangle" ? 250 : type === "leaderboard" ? 90 : type === "banner-320x50" ? 50 : type === "banner-160x300" ? 300 : type === "banner-468x60" ? 60 : 90)
  const minW = type === "skyscraper" ? 160 : type === "medium-rectangle" ? 300 : type === "leaderboard" ? 728 : type === "banner-320x50" ? 320 : type === "banner-160x300" ? 160 : type === "banner-468x60" ? 468 : undefined

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ minHeight: h, minWidth: minW }}
    />
  )
}
