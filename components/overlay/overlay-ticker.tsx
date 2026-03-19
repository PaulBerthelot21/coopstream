"use client"

import * as React from "react"

import type { Challenge } from "@/lib/types/challenge"

type OverlayTickerProps = {
  selected: Challenge | null
  challenges: Challenge[]
}

export function OverlayTicker({ selected, challenges }: OverlayTickerProps) {
  return (
    <div className="w-full">
      <div className="rounded-xl bg-black/80 px-4 py-2 ring-1 ring-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-3 text-[11px] text-white/80">
          <span className="rounded-full bg-sky-500/20 px-2 py-0.5 font-semibold uppercase tracking-[0.2em] text-sky-200">
            Challenges
          </span>
          <div className="flex-1 overflow-hidden">
            <div className="flex gap-3 animate-[marquee_35s_linear_infinite]">
              {challenges.concat(challenges).map((c, idx) => (
                <span
                  key={`${c.id}-simple-${idx}`}
                  className={
                    "shrink-0 whitespace-nowrap" +
                    (c.id === selected?.id
                      ? " text-white font-semibold"
                      : " text-white/70")
                  }
                >
                  {c.title}
                  {typeof c.target === "number"
                    ? ` (${c.current ?? 0}/${c.target} ${c.unit ?? ""})`
                    : ""}
                  <span className="mx-2 text-white/30">•</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

