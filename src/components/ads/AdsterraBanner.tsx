"use client"
import { useEffect, useRef } from "react"

interface AdsterraBannerProps {
  type: "responsive" | "skyscraper" | "small-skyscraper"
  className?: string
}

export function AdsterraBanner({ type, className }: AdsterraBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const container = containerRef.current
    container.innerHTML = ""

    if (type === "responsive") {
      const script = document.createElement("script")
      script.async = true
      script.setAttribute("data-cfasync", "false")
      script.src = "https://evidentbummerhike.com/f301214e059ca70b56b447bf6850594e/invoke.js"
      container.appendChild(script)
      const div = document.createElement("div")
      div.id = "container-f301214e059ca70b56b447bf6850594e"
      container.appendChild(div)
    }

    if (type === "skyscraper") {
      const inline = document.createElement("script")
      inline.text = `
        atOptions = {
          'key' : '14c436bda0b1d02724d0618980143ce5',
          'format' : 'iframe',
          'height' : 600,
          'width' : 160,
          'params' : {}
        };
      `
      container.appendChild(inline)
      const invoke = document.createElement("script")
      invoke.src = "https://evidentbummerhike.com/14c436bda0b1d02724d0618980143ce5/invoke.js"
      container.appendChild(invoke)
    }

    if (type === "small-skyscraper") {
      const inline = document.createElement("script")
      inline.text = `
        atOptions = {
          'key' : '0eda691a40adbc5636d43af20fdda82d',
          'format' : 'iframe',
          'height' : 300,
          'width' : 160,
          'params' : {}
        };
      `
      container.appendChild(inline)
      const invoke = document.createElement("script")
      invoke.src = "https://evidentbummerhike.com/0eda691a40adbc5636d43af20fdda82d/invoke.js"
      container.appendChild(invoke)
    }

    return () => { container.innerHTML = "" }
  }, [type])

  return <div ref={containerRef} className={className} />
}
