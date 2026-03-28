"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { motion } from "framer-motion"

import { OverlayIntroCountdown } from "@/components/overlay/overlay-intro-countdown"
import type { IntroCsFxLevel } from "@/components/overlay/overlay-intro-cs-canvas"

const IntroCsCanvas = dynamic(
  () =>
    import("@/components/overlay/overlay-intro-cs-canvas").then((m) => m.IntroCsCanvas),
  {
    ssr: false,
    loading: () => (
      <div
        className="absolute inset-0 bg-[#120f0c]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 90% 70% at 50% 40%, rgba(251,191,36,0.12), transparent), radial-gradient(ellipse 60% 50% at 20% 80%, rgba(52,211,153,0.08), transparent)",
        }}
      />
    ),
  }
)

export type { IntroCsFxLevel }

export function OverlayIntroCs({
  startSeconds = 300,
  subtitle = "",
  fx = "medium",
}: {
  startSeconds?: number
  subtitle?: string
  fx?: IntroCsFxLevel
}) {
  return (
    <div className="pointer-events-none relative h-full w-full overflow-hidden bg-black">
      <div className="absolute inset-0 z-0">
        <IntroCsCanvas fx={fx} />
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(900px_600px_at_50%_0%,rgba(18,15,12,0.35),transparent_50%),linear-gradient(to_bottom,rgba(18,15,12,0.5),transparent_30%,transparent_70%,rgba(18,15,12,0.82))]"
      />

      {subtitle.trim() ? (
        <div className="absolute left-6 top-[38%] z-[2] w-[min(92vw,42rem)] max-w-[42rem] sm:left-10 sm:top-[39%] md:top-[40%] lg:top-[41%]">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="text-[10px] uppercase tracking-[0.24em] text-emerald-200/55 sm:text-[11px] md:text-xs">
              Bientot en direct
            </div>
            <div className="mt-2 bg-gradient-to-r from-emerald-100 via-amber-100 to-orange-100 bg-clip-text font-semibold leading-[1.08] tracking-tight text-transparent text-[clamp(1.9rem,4.8vmin+0.9rem,4.35rem)] drop-shadow-[0_0_24px_rgba(52,211,153,0.25)]">
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
