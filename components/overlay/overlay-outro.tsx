"use client"

import * as React from "react"
import { motion } from "framer-motion"

import { OverlayIntroParticles } from "@/components/overlay/overlay-intro-particles"

type IntroFxLevel = "off" | "low" | "medium" | "high"

export function OverlayOutro({
  title = "Merci d'avoir suivi",
  subtitle = "",
  fx = "medium",
}: {
  title?: string
  subtitle?: string
  fx?: IntroFxLevel
}) {
  return (
    <div className="pointer-events-none relative h-full w-full overflow-hidden bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(1200px_700px_at_90%_100%,rgba(76,29,149,0.3),transparent_60%),radial-gradient(900px_500px_at_0%_0%,rgba(56,189,248,0.16),transparent_60%),linear-gradient(to_bottom,rgba(2,6,23,0.96),rgba(2,6,23,0.88))]" />
      <OverlayIntroParticles fx={fx} />

      <motion.div
        aria-hidden
        className="absolute -right-24 top-[16%] h-[42vh] w-[42vh] rounded-full bg-violet-500/20 blur-3xl"
        animate={{ x: [0, -18, 8, 0], y: [0, 10, -8, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute -left-24 bottom-[8%] h-[46vh] w-[46vh] rounded-full bg-sky-500/14 blur-3xl"
        animate={{ x: [0, 14, -8, 0], y: [0, -8, 8, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative flex h-full w-full items-center justify-center px-8">
        <div className="w-full max-w-[980px] text-center">
          <div className="text-[18px] uppercase tracking-[0.26em] text-white/45">
            Stream terminé
          </div>
          <div className="mt-4 text-[5.625rem] font-semibold leading-[1.02] text-white/95 drop-shadow-[0_0_20px_rgba(0,0,0,0.78)]">
            {title.trim() || "Merci d'avoir suivi"}
          </div>
          {subtitle.trim() ? (
            <div className="mx-auto mt-5 max-w-[760px] text-4xl font-medium leading-snug text-white/75 drop-shadow-[0_0_16px_rgba(0,0,0,0.7)]">
              {subtitle}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

