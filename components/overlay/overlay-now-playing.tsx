"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"

import type { Challenge } from "@/lib/types/challenge"

type OverlayNowPlayingProps = {
  selected: Challenge | null
}

export function OverlayNowPlaying({ selected }: OverlayNowPlayingProps) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-6 -top-6 h-12 rounded-full bg-gradient-to-r from-sky-500/40 via-transparent to-violet-500/40 blur-2xl" />
      <div className="relative flex items-center gap-4 rounded-2xl bg-black/80 px-5 py-3 ring-1 ring-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/70">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
          <span>Challenge</span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={selected?.id ?? "none"}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="min-w-0"
            >
              <div className="truncate text-sm font-medium text-white">
                {selected?.title ?? "Aucun challenge sélectionné"}
              </div>
              {typeof selected?.target === "number" && (
                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-white/70">
                  <div className="h-1 w-28 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-lime-300"
                      style={{
                        width: `${Math.min(
                          100,
                          ((selected.current ?? 0) / selected.target) * 100,
                        ).toFixed(0)}%`,
                      }}
                    />
                  </div>
                  <span>
                    {selected.current ?? 0}/{selected.target}{" "}
                    {selected.unit ?? ""}
                  </span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        {selected?.reward && (
          <div className="shrink-0 rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] text-emerald-200 ring-1 ring-emerald-400/40">
            Reward: {selected.reward}
          </div>
        )}
      </div>
    </div>
  )
}

