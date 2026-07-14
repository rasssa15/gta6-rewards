"use client"
import { useEffect, useRef, useState } from "react"

interface LazyAdProps {
  type: "responsive" | "skyscraper" | "medium-rectangle" | "leaderboard" | "banner-320x50" | "banner-160x300" | "banner-468x60"
  minHeight?: number
  className?: string
  containerSuffix?: string
}

interface AdConfig {
  key: string
  containerId: string
  script: string
  height: number
  width: number
}

const AD_CONFIG: Record<string, AdConfig> = {
  responsive: {
    key: "f301214e059ca70b56b447bf6850594e",
    containerId: "container-f301214e059ca70b56b447bf6850594e",
    script: "https://evidentbummerhike.com/f301214e059ca70b56b447bf6850594e/invoke.js",
    height: 280,
    width: 300,
  },
  skyscraper: {
    key: "14c436bda0b1d02724d0618980143ce5",
    containerId: "container-14c436bda0b1d02724d0618980143ce5",
    script: "https://evidentbummerhike.com/14c436bda0b1d02724d0618980143ce5/invoke.js",
    height: 600,
    width: 160,
  },
  "medium-rectangle": {
    key: "bec02ef6fdbfe5fe80e15c3c4f9f4b58",
    containerId: "container-bec02ef6fdbfe5fe80e15c3c4f9f4b58",
    script: "https://evidentbummerhike.com/bec02ef6fdbfe5fe80e15c3c4f9f4b58/invoke.js",
    height: 250,
    width: 300,
  },
  leaderboard: {
    key: "7e7419c72404cab7787c27dfdac31321",
    containerId: "container-7e7419c72404cab7787c27dfdac31321",
    script: "https://evidentbummerhike.com/7e7419c72404cab7787c27dfdac31321/invoke.js",
    height: 90,
    width: 728,
  },
  "banner-320x50": {
    key: "a32d05859c7cdc4b19c45ea2746367ad",
    containerId: "container-a32d05859c7cdc4b19c45ea2746367ad",
    script: "https://evidentbummerhike.com/a32d05859c7cdc4b19c45ea2746367ad/invoke.js",
    height: 50,
    width: 320,
  },
  "banner-160x300": {
    key: "0eda691a40adbc5636d43af20fdda82d",
    containerId: "container-0eda691a40adbc5636d43af20fdda82d",
    script: "https://evidentbummerhike.com/0eda691a40adbc5636d43af20fdda82d/invoke.js",
    height: 300,
    width: 160,
  },
  "banner-468x60": {
    key: "ab7ca47a4d4e9c1d01cb3978051a9800",
    containerId: "container-ab7ca47a4d4e9c1d01cb3978051a9800",
    script: "https://evidentbummerhike.com/ab7ca47a4d4e9c1d01cb3978051a9800/invoke.js",
    height: 60,
    width: 468,
  },
}

// Adsterra's multi-placement safe method: a uniquely-id'd container +
// the invoke.js script. Each ad renders into its own container, so many
// ads can coexist on one page (the old atOptions + document.write method
// collided and broke when several banners were present).
export function LazyAd({ type, minHeight, className, containerSuffix }: LazyAdProps) {
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

    const id = containerSuffix ? `${config.containerId}-${containerSuffix}` : config.containerId
    const div = document.createElement("div")
    div.id = id
    container.appendChild(div)

    const script = document.createElement("script")
    script.async = true
    script.setAttribute("data-cfasync", "false")
    script.src = config.script
    container.appendChild(script)

    setLoaded(true)
    return () => {
      container.innerHTML = ""
    }
  }, [visible, loaded, type, containerSuffix])

  const config = AD_CONFIG[type]
  const h = minHeight || config.height

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ minHeight: h }}
    />
  )
}
