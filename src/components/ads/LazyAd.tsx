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
    key: "14c436b60c41a18bb9f73c3ebfe72863",
    height: 600,
    width: 160,
    script: "https://evidentbummerhike.com/14c436b60c41a18bb9f73c3ebfe72863/invoke.js",
    containerId: "container-14c436b60c41a18bb9f73c3ebfe72863",
  },
  "small-skyscraper": {
    key: "0eda691a2c2d80a93114f023a3d7f665",
    height: 300,
    width: 160,
    script: "https://evidentbummerhike.com/0eda691a2c2d80a93114f023a3d7f665/invoke.js",
    containerId: "container-0eda691a2c2d80a93114f023a3d7f665",
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

    const div = document.createElement("div")
    div.id = config.containerId
    container.appendChild(div)

    const script = document.createElement("script")
    script.async = true
    script.setAttribute("data-cfasync", "false")
    script.src = config.script
    container.appendChild(script)

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
