"use client"

import * as React from "react"
import { motion } from "framer-motion"

import { OverlayIntroParticles } from "@/components/overlay/overlay-intro-particles"

type IntroFxLevel = "off" | "low" | "medium" | "high"

export function OverlayPause({
  title = "Pause",
  subtitle = "",
  fx = "medium",
}: {
  title?: string
  subtitle?: string
  fx?: IntroFxLevel
}) {
  return (
    <div className="pointer-events-none relative h-full w-full overflow-hidden bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(1000px_600px_at_12%_88%,rgba(91,33,182,0.24),transparent_62%),radial-gradient(860px_460px_at_88%_14%,rgba(56,189,248,0.14),transparent_60%),linear-gradient(to_bottom,rgba(2,6,23,0.97),rgba(2,6,23,0.9))]" />
      <OverlayIntroParticles fx={fx} />

      <motion.div
        aria-hidden
        className="absolute -left-24 top-[20%] h-[40vh] w-[40vh] rounded-full bg-violet-500/16 blur-3xl"
        animate={{ x: [0, 16, -8, 0], y: [0, 8, -6, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute -right-20 bottom-[14%] h-[34vh] w-[34vh] rounded-full bg-sky-500/14 blur-3xl"
        animate={{ x: [0, -14, 8, 0], y: [0, -8, 10, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative flex h-full w-full items-center justify-center px-8">
        <div className="w-full max-w-[860px] rounded-3xl border border-white/15 bg-black/48 px-10 py-12 text-center ring-1 ring-white/10 backdrop-blur-xl">
          <div className="text-[12px] uppercase tracking-[0.24em] text-white/50">Le stream revient bientôt</div>
          <div className="mt-4 text-7xl font-semibold leading-none text-white/95 drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]">
            {title.trim() || "Pause"}
          </div>
          {subtitle.trim() ? (
            <div className="mx-auto mt-5 max-w-[680px] text-2xl font-medium leading-snug text-white/75 drop-shadow-[0_0_14px_rgba(0,0,0,0.75)]">
              {subtitle}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

