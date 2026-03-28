"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { motion } from "framer-motion"

import { OverlayIntroCountdown } from "@/components/overlay/overlay-intro-countdown"
import type { Intro3dFxLevel, Intro3dSceneId } from "@/components/overlay/overlay-intro-3d-canvas"

const Intro3DCanvas = dynamic(
  () =>
    import("@/components/overlay/overlay-intro-3d-canvas").then((m) => m.Intro3DCanvas),
  {
    ssr: false,
    loading: () => (
      <div
        className="absolute inset-0 bg-[#020617]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 60% at 50% 45%, rgba(76,29,149,0.35), transparent), radial-gradient(ellipse 60% 50% at 70% 20%, rgba(14,165,233,0.15), transparent)",
        }}
      />
    ),
  }
)

export type { Intro3dFxLevel, Intro3dSceneId }

export function OverlayIntro3D({
  startSeconds = 300,
  subtitle = "",
  fx = "medium",
  scene = "portal",
}: {
  startSeconds?: number
  subtitle?: string
  fx?: Intro3dFxLevel
  scene?: Intro3dSceneId
}) {
  return (
    <div className="pointer-events-none relative h-full w-full overflow-hidden bg-black">
      <div className="absolute inset-0 z-0">
        <Intro3DCanvas key={scene} scene={scene} fx={fx} />
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(1200px_800px_at_50%_0%,rgba(2,6,23,0.15),transparent_55%),linear-gradient(to_bottom,rgba(2,6,23,0.55),transparent_35%,transparent_65%,rgba(2,6,23,0.75))]"
      />

      {subtitle.trim() ? (
        <div className="absolute left-6 top-[38%] z-[2] w-[min(92vw,42rem)] max-w-[42rem] sm:left-10 sm:top-[39%] md:top-[40%] lg:top-[41%]">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="text-[10px] uppercase tracking-[0.24em] text-white/50 sm:text-[11px] md:text-xs">
              Bientot en direct
            </div>
            <div className="mt-2 bg-gradient-to-r from-white via-violet-100 to-sky-200 bg-clip-text font-semibold leading-[1.08] tracking-tight text-transparent text-[clamp(1.9rem,4.8vmin+0.9rem,4.35rem)] drop-shadow-[0_0_28px_rgba(139,92,246,0.35)]">
              {subtitle}
            </div>
          </motion.div>
        </div>
      ) : null}

      <div className="relative z-[2] flex h-full w-full items-end justify-start px-10 pb-10">
        <OverlayIntroCountdown startSeconds={startSeconds} />
      </div>
    </div>
  )
}
