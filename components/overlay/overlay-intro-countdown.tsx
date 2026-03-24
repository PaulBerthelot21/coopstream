"use client"

import * as React from "react"
import { motion } from "framer-motion"

function formatClock(totalSeconds: number) {
  const safe = Math.max(0, totalSeconds)
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

export function OverlayIntroCountdown({
  startSeconds = 300,
}: {
  startSeconds?: number
}) {
  const [remaining, setRemaining] = React.useState<number>(Math.max(0, startSeconds))

  React.useEffect(() => {
    setRemaining(Math.max(0, startSeconds))
  }, [startSeconds])

  React.useEffect(() => {
    if (remaining <= 0) return
    const id = window.setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [remaining])

  const total = Math.max(1, startSeconds)
  const progress = Math.min(100, Math.max(0, ((total - remaining) / total) * 100))

  return (
    <div className="relative w-full max-w-[460px] overflow-hidden rounded-3xl border border-white/20 bg-black/72 px-6 py-5 ring-1 ring-white/15 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.45)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-r from-sky-500/20 via-transparent to-violet-500/25 blur-2xl" />

      <div className="relative text-left">
        <div className="text-[11px] uppercase tracking-[0.22em] text-white/60">Intro en cours</div>
        <motion.div
          key={remaining}
          initial={{ opacity: 0.4, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.18 }}
          className="mt-2 font-mono text-5xl font-bold leading-none text-white drop-shadow-[0_0_18px_rgba(0,0,0,0.8)]"
        >
          {formatClock(remaining)}
        </motion.div>
      </div>

      <div className="relative mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-400 to-sky-400 transition-[width] duration-500"
          style={{ width: `${progress.toFixed(2)}%` }}
        />
      </div>
    </div>
  )
}

