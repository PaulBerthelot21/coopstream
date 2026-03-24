"use client"

import * as React from "react"

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  a: number
  hue: number
}

type IntroFxLevel = "low" | "medium" | "high"

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function getFxConfig(level: IntroFxLevel) {
  if (level === "low") {
    return {
      particleCount: 36,
      speedMul: 0.75,
      spriteAlphaMul: 0.75,
      particleAlphaMul: 0.8,
    }
  }
  if (level === "high") {
    return {
      particleCount: 130,
      speedMul: 1.2,
      spriteAlphaMul: 1.25,
      particleAlphaMul: 1.15,
    }
  }
  return {
    particleCount: 80,
    speedMul: 1,
    spriteAlphaMul: 1,
    particleAlphaMul: 1,
  }
}

export function OverlayIntroParticles({
  fx = "medium",
}: {
  fx?: IntroFxLevel
}) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const cfg = React.useMemo(() => getFxConfig(fx), [fx])

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let width = 0
    let height = 0
    let raf = 0
    let running = true

    const particles: Particle[] = []

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      width = Math.max(1, parent.clientWidth)
      height = Math.max(1, parent.clientHeight)
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const resetParticle = (p: Particle, fromTop = false) => {
      p.x = rand(0, width)
      p.y = fromTop ? rand(-height * 0.2, 0) : rand(0, height)
      p.vx = rand(-0.08, 0.08) * cfg.speedMul
      p.vy = rand(0.06, 0.24) * cfg.speedMul
      p.r = rand(0.8, 2.8)
      p.a = rand(0.12, 0.45) * cfg.particleAlphaMul
      p.hue = rand(220, 275)
    }

    const init = () => {
      particles.length = 0
      for (let i = 0; i < cfg.particleCount; i++) {
        const p = {
          x: 0,
          y: 0,
          vx: 0,
          vy: 0,
          r: 0,
          a: 0,
          hue: 0,
        }
        resetParticle(p, false)
        particles.push(p)
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      // Soft vignette layer for depth.
      const grad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.55,
        40,
        width * 0.5,
        height * 0.55,
        Math.max(width, height) * 0.65,
      )
      grad.addColorStop(0, "rgba(14, 16, 30, 0.0)")
      grad.addColorStop(1, "rgba(4, 6, 14, 0.34)")
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, width, height)

      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.y > height + 10 || p.x < -20 || p.x > width + 20) {
          resetParticle(p, true)
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue}, 95%, 72%, ${p.a})`
        ctx.fill()

        // Tiny glow tail
        ctx.beginPath()
        ctx.arc(p.x - p.vx * 10, p.y - p.vy * 10, p.r * 1.8, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue}, 90%, 65%, ${p.a * 0.18})`
        ctx.fill()
      }

      // Sprite-like floating discs.
      const t = performance.now() * 0.001
      const sprites = [
        {
          x: width * 0.18 + Math.sin(t * 0.9) * 16,
          y: height * 0.22 + Math.cos(t * 1.1) * 12,
          r: 34,
          c: `rgba(167,139,250,${(0.12 * cfg.spriteAlphaMul).toFixed(3)})`,
        },
        {
          x: width * 0.78 + Math.cos(t * 0.7) * 24,
          y: height * 0.28 + Math.sin(t * 0.8) * 14,
          r: 42,
          c: `rgba(56,189,248,${(0.1 * cfg.spriteAlphaMul).toFixed(3)})`,
        },
        {
          x: width * 0.62 + Math.sin(t * 0.55) * 20,
          y: height * 0.72 + Math.cos(t * 0.7) * 10,
          r: 28,
          c: `rgba(129,140,248,${(0.1 * cfg.spriteAlphaMul).toFixed(3)})`,
        },
      ]
      for (const s of sprites) {
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = s.c
        ctx.fill()
      }
    }

    const tick = () => {
      if (!running) return
      draw()
      raf = window.requestAnimationFrame(tick)
    }

    resize()
    init()
    tick()
    window.addEventListener("resize", resize)

    return () => {
      running = false
      window.removeEventListener("resize", resize)
      window.cancelAnimationFrame(raf)
    }
  }, [cfg])

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />
}

