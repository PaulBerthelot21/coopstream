"use client"

import * as React from "react"

import type { Challenge } from "@/lib/types/challenge"

type OverlayPillStackProps = {
  selected: Challenge | null
  challenges: Challenge[]
}

export function OverlayPillStack({
  selected,
  challenges,
}: OverlayPillStackProps) {
  const ordered = React.useMemo(() => {
    if (!selected) return challenges.slice(0, 3)
    const idx = challenges.findIndex((c) => c.id === selected.id)
    if (idx === -1) return challenges.slice(0, 3)
    const slice = challenges.slice(idx, idx + 3)
    if (slice.length < 3) {
      slice.push(
        ...challenges
          .filter((c) => !slice.some((s) => s.id === c.id))
          .slice(0, 3 - slice.length),
      )
    }
    return slice
  }, [challenges, selected])

  return (
    <div className="inline-flex flex-col gap-2 rounded-2xl bg-black/75 px-3 py-3 ring-1 ring-white/10 backdrop-blur-xl">
      <span className="px-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
        File de défis
      </span>
      <div className="flex flex-col gap-2">
        {ordered.map((c, index) => {
          const isCurrent = c.id === selected?.id
          return (
            <div
              key={c.id}
              className={
                "flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] " +
                (isCurrent
                  ? "bg-sky-500/25 text-white ring-1 ring-sky-400/60 shadow-[0_0_18px_rgba(56,189,248,0.6)]"
                  : "bg-white/5 text-white/75 ring-1 ring-white/10")
              }
            >
              <span className="text-[10px] text-white/50">
                {index === 0 ? "Now" : index === 1 ? "Next" : "Later"}
              </span>
              <span className="flex-1 truncate">{c.title}</span>
              {typeof c.target === "number" && (
                <span className="shrink-0 text-[10px] text-white/65">
                  {c.current ?? 0}/{c.target}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

