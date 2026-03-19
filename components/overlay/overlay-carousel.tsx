"use client"

import * as React from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"

import type { Challenge } from "@/lib/types/challenge"

type OverlayCarouselProps = {
  challenges: Challenge[]
}

const INTERVAL_MS = 5000

export function OverlayCarousel({ challenges }: OverlayCarouselProps) {
  const [index, setIndex] = React.useState(0)
  const [paused, setPaused] = React.useState(false)

  const ordered = React.useMemo(
    () =>
      [...challenges].sort(
        (a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0),
      ),
    [challenges],
  )

  React.useEffect(() => {
    if (ordered.length === 0 || paused) return
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % ordered.length)
    }, INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [ordered.length, paused])

  if (ordered.length === 0) return null

  const current = ordered[index] ?? ordered[0]

  return (
    <div
      className="relative flex items-center justify-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="pointer-events-none absolute inset-x-6 -top-4 h-12 rounded-full bg-gradient-to-r from-sky-500/25 via-transparent to-violet-500/25 blur-2xl" />
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ duration: 0.25 }}
          className="relative flex w-full max-w-xl items-stretch gap-4 rounded-2xl bg-black/80 px-5 py-3 ring-1 ring-white/10 backdrop-blur-xl"
        >
          {current.skinImageUrl && (
            <div className="relative hidden h-20 w-40 overflow-hidden rounded-xl bg-black/60 ring-1 ring-white/10 sm:block">
              <Image
                src={current.skinImageUrl}
                alt={current.title}
                fill
                className="object-contain"
              />
            </div>
          )}
          <div className="flex flex-1 flex-col justify-center gap-2">
            <div className="flex items-baseline justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
                  Défi #{index + 1}/{ordered.length}
                </div>
                <div className="mt-0.5 line-clamp-2 text-sm font-medium text-white">
                  {current.title}
                </div>
              </div>
              {typeof current.target === "number" && (
                <div className="shrink-0 text-right text-[11px] text-white/70">
                  <div>
                    {current.current ?? 0}/{current.target}{" "}
                    {current.unit ?? ""}
                  </div>
                  <div className="mt-1 h-1 w-20 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-lime-300"
                      style={{
                        width: `${Math.min(
                          100,
                          ((current.current ?? 0) / current.target) * 100,
                        ).toFixed(0)}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            {current.reward && (
              <div className="mt-1 flex items-center gap-2 text-[11px] text-white/70">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
                <span className="truncate">
                  {current.reward}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

