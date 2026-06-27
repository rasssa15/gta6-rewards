"use client"
import { useEffect, useRef, useCallback } from "react"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  alpha: number
  life: number
  maxLife: number
  color: string
}

const COLORS = ["#ff0066", "#00ccff", "#9b2eff", "#ffcf3f"]

export default function ParticleBackground({ intensity = 1 }: { intensity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const rafRef = useRef<number>(0)

  const spawnParticle = useCallback((w: number, h: number) => {
    const angle = Math.random() * Math.PI * 2
    const speed = 0.3 + Math.random() * 0.8
    return {
      x: w / 2 + (Math.random() - 0.5) * w * 0.6,
      y: h / 2 + (Math.random() - 0.5) * h * 0.6,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 0.5,
      size: 1.5 + Math.random() * 3,
      alpha: 0.3 + Math.random() * 0.7,
      life: 0,
      maxLife: 60 + Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    particlesRef.current = Array.from({ length: Math.floor(30 * intensity) }, () =>
      spawnParticle(canvas.width, canvas.height)
    )

    let frame = 0
    const animate = () => {
      frame++
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const particles = particlesRef.current
      const spawnRate = Math.floor(2 * intensity)

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.01
        p.life++
        p.alpha = Math.max(0, (1 - p.life / p.maxLife) * (0.3 + Math.random() * 0.4))

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.alpha
        ctx.fill()

        if (p.life >= p.maxLife || p.y > canvas.height + 10) {
          particles[i] = spawnParticle(canvas.width, canvas.height)
        }
      }

      if (frame % 3 === 0) {
        for (let i = 0; i < spawnRate; i++) {
          particles.push(spawnParticle(canvas.width, canvas.height))
        }
      }

      if (particles.length > 150 * intensity) {
        particles.splice(0, particles.length - Math.floor(150 * intensity))
      }

      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(rafRef.current)
    }
  }, [intensity, spawnParticle])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      aria-hidden="true"
    />
  )
}
