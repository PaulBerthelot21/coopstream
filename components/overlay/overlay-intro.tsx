"use client"

import * as React from "react"
import { motion } from "framer-motion"

import { OverlayIntroCountdown } from "@/components/overlay/overlay-intro-countdown"

export function OverlayIntro({
  startSeconds = 300,
}: {
  startSeconds?: number
}) {
  return (
    <div className="pointer-events-none relative h-full w-full overflow-hidden bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(1200px_700px_at_10%_100%,rgba(76,29,149,0.28),transparent_60%),radial-gradient(900px_500px_at_100%_0%,rgba(14,165,233,0.18),transparent_60%),linear-gradient(to_bottom,rgba(2,6,23,0.95),rgba(2,6,23,0.85))]" />

      <motion.div
        aria-hidden
        className="absolute -left-16 top-[18%] h-[38vh] w-[38vh] rounded-full bg-violet-500/20 blur-3xl"
        animate={{ x: [0, 24, -8, 0], y: [0, 10, -12, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute -right-24 top-[10%] h-[44vh] w-[44vh] rounded-full bg-sky-500/16 blur-3xl"
        animate={{ x: [0, -18, 10, 0], y: [0, -10, 8, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute left-[22%] bottom-[18%] h-[28vh] w-[28vh] rounded-full bg-indigo-500/14 blur-3xl"
        animate={{ x: [0, 10, -4, 0], y: [0, -6, 6, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative flex h-full w-full items-end justify-start px-10 pb-10">
        <OverlayIntroCountdown startSeconds={startSeconds} />
      </div>
    </div>
  )
}

