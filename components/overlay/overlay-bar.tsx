"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"

import type { Challenge } from "@/lib/types/challenge"

type OverlayBarProps = {
  selected: Challenge | null
  challenges: Challenge[]
}

export function OverlayBar({ selected, challenges }: OverlayBarProps) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-4 -top-4 h-10 rounded-full bg-gradient-to-r from-[#49b6ff]/30 via-transparent to-[#7c3aed]/30 blur-2xl" />
      <div className="relative flex flex-col gap-2 rounded-2xl bg-black/70 px-5 py-3 ring-1 ring-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="h-6 w-1 rounded-full bg-gradient-to-b from-[#49b6ff] to-[#7c3aed] shadow-[0_0_10px_rgba(73,182,255,0.9)]" />
          <div className="flex flex-1 items-baseline justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/60">
                Challenge en cours
              </span>
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={selected?.id ?? "none"}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-3"
                >
                  <span className="max-w-[460px] truncate text-lg font-semibold text-white">
                    {selected?.title ?? "Aucun challenge sélectionné"}
                  </span>
                  {typeof selected?.target === "number" && (
                    <div className="flex items-center gap-2 text-xs text-white/80">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#22c55e] to-[#a3e635]"
                          style={{
                            width: `${Math.min(
                              100,
                              ((selected.current ?? 0) / selected.target) *
                                100,
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
              <div className="hidden shrink-0 items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs text-white/80 ring-1 ring-white/10 md:inline-flex">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
                <span className="truncate max-w-[220px]">
                  Reward: {selected.reward}
                </span>
              </div>
            )}
          </div>
        </div>

        {challenges.length > 0 && (
          <div className="relative mt-1 overflow-hidden">
            <div className="pointer-events-none absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-black/80 to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-black/80 to-transparent" />
            <div className="flex gap-3 animate-[marquee_40s_linear_infinite]">
              {challenges.concat(challenges).map((c, idx) => (
                <div
                  key={`${c.id}-${idx}`}
                  className="flex shrink-0 items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-[11px] text-white/80 ring-1 ring-white/10"
                >
                  <span
                    className={
                      c.id === selected?.id
                        ? "h-1.5 w-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.9)]"
                        : "h-1.5 w-1.5 rounded-full bg-white/50"
                    }
                  />
                  <span className="max-w-[260px] truncate">
                    {c.title}
                    {typeof c.target === "number"
                      ? ` · ${c.current ?? 0}/${c.target} ${c.unit ?? ""}`
                      : null}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

