"use client"

import * as React from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { getOverlayPresetTheme, type OverlayPreset } from "@/lib/overlay/presets"

import { OverlayIntroTitle } from "./overlay-intro-title"

import type { ChibiVariant } from "@/lib/overlay/live-elements"

export function OverlayBrandTitle({ animated = true }: { animated?: boolean }) {
  return <OverlayIntroTitle animated={animated} />
}

export function OverlayChibi({ variant, animate }: { variant: ChibiVariant; animate: boolean }) {
  const assets = getOverlayPresetTheme("lecalme-rebrand").assets
  const src = variant === "follow" ? assets?.chibiFollowUrl : variant === "sub" ? assets?.chibiSubUrl : variant === "raid" ? assets?.chibiRaidUrl : assets?.chibiUrl
  return src ? <motion.div className="relative h-full w-full" animate={animate ? { y: [0, -12, 0], rotate: [-2, 2, -2] } : { y: 0, rotate: 0 }} transition={{ duration: 5, repeat: animate ? Infinity : 0, ease: "easeInOut" }}><Image src={src} alt="Chibi Le Calme" fill unoptimized priority className="object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,.55)]" sizes="320px" /></motion.div> : null
}

export function OverlayTimer({ seconds, preset }: { seconds: number; preset: OverlayPreset }) {
  const [remaining, setRemaining] = React.useState(seconds)
  React.useEffect(() => {
    const end = Date.now() + seconds * 1000
    setRemaining(seconds)
    const timer = window.setInterval(() => {
      const next = Math.max(0, Math.ceil((end - Date.now()) / 1000))
      setRemaining(next)
      if (next === 0) window.clearInterval(timer)
    }, 200)
    return () => window.clearInterval(timer)
  }, [seconds])
  const visual = getOverlayPresetTheme(preset)
  const accent = visual.accentColor ?? "var(--primary)"
  const progress = seconds > 0 ? Math.min(100, (seconds - remaining) / seconds * 100) : 100
  return <div className="flex w-full flex-col items-center justify-center gap-4"><div className="font-black tabular-nums leading-none tracking-tight text-white" style={{ fontSize: "clamp(32px, 18vw, 96px)", textShadow: `0 0 28px color-mix(in srgb, ${accent} 33%, transparent), 0 4px 22px rgba(0,0,0,.9)` }}>{String(Math.floor(remaining / 60)).padStart(2, "0")}:{String(remaining % 60).padStart(2, "0")}</div><div className="h-[3px] w-40 max-w-full overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full transition-[width] duration-200" style={{ width: `${progress}%`, background: accent }} /></div></div>
}
