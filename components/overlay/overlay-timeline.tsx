"use client"

import * as React from "react"

import type { Challenge } from "@/lib/types/challenge"

type OverlayTimelineProps = {
  selected: Challenge | null
  challenges: Challenge[]
}

export function OverlayTimeline({
  selected,
  challenges,
}: OverlayTimelineProps) {
  const items = React.useMemo(
    () =>
      [...challenges].sort(
        (a, b) => (a.updatedAt ?? 0) - (b.updatedAt ?? 0),
      ),
    [challenges],
  )

  if (items.length === 0) {
    return null
  }

  return (
    <div className="w-full rounded-2xl bg-black/80 px-4 py-3 ring-1 ring-white/10 backdrop-blur-xl">
      <div className="mb-2 flex items-center justify-between text-[11px] text-white/60">
        <span className="font-semibold uppercase tracking-[0.2em]">
          Timeline de la session
        </span>
      </div>
      <div className="relative mt-1 h-8">
        <div className="absolute inset-y-1 left-0 right-0 rounded-full bg-white/5" />
        <div className="absolute inset-y-1 left-0 right-0 flex overflow-hidden rounded-full">
          {items.map((c) => {
            const isCurrent = c.id === selected?.id
            return (
              <div
                key={c.id}
                className={
                  "flex-1 border-r border-white/10 px-2 text-center text-[10px] leading-7 text-white/70 last:border-r-0 " +
                  (isCurrent ? "bg-sky-500/25 text-white font-semibold" : "")
                }
              >
                <span className="inline-block max-w-[120px] truncate">
                  {c.title}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

