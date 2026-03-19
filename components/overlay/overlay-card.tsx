"use client"

import * as React from "react"

import type { Challenge } from "@/lib/types/challenge"

type OverlayCardProps = {
  selected: Challenge | null
}

export function OverlayCard({ selected }: OverlayCardProps) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-4 -top-4 h-16 rounded-3xl bg-gradient-to-br from-[#0f172a] via-transparent to-[#22c55e]/40 blur-2xl" />
      <div className="relative rounded-3xl bg-black/75 px-6 py-4 ring-1 ring-white/10 backdrop-blur-2xl">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
              CoopStream · Challenge
            </span>
            <span className="line-clamp-2 text-xl font-semibold text-white">
              {selected?.title ?? "Aucun challenge sélectionné"}
            </span>
          </div>
          {typeof selected?.target === "number" && (
            <div className="flex min-w-[180px] flex-col items-end gap-1 text-xs text-white/80">
              <span>Progression</span>
              <div className="h-2 w-40 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#22c55e] via-[#eab308] to-[#f97316]"
                  style={{
                    width: `${Math.min(
                      100,
                      ((selected.current ?? 0) / selected.target) * 100,
                    ).toFixed(0)}%`,
                  }}
                />
              </div>
              <span className="text-[11px]">
                {selected.current ?? 0}/{selected.target}{" "}
                {selected.unit ?? ""}
              </span>
            </div>
          )}
        </div>
        {selected?.reward && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-[11px] text-white/80 ring-1 ring-white/10">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
            <span className="truncate max-w-[260px]">
              Reward: {selected.reward}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

