"use client"

import * as React from "react"
import Image from "next/image"

import type { Challenge } from "@/lib/types/challenge"

type OverlayScoreboardProps = {
  selected: Challenge | null
}

export function OverlayScoreboard({ selected }: OverlayScoreboardProps) {
  const ratio =
    typeof selected?.target === "number" && selected.target > 0
      ? Math.min(1, (selected.current ?? 0) / selected.target)
      : null

  const colorClass =
    ratio == null
      ? "text-white"
      : ratio < 0.33
        ? "text-red-400"
        : ratio < 0.66
          ? "text-yellow-300"
          : "text-emerald-300"

  return (
    <div className="inline-flex items-stretch gap-px rounded-xl bg-white/10 text-xs text-white/80 ring-1 ring-white/15 backdrop-blur-xl">
      <div className="flex items-center gap-1 rounded-l-xl bg-black/80 px-3 py-2">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.9)]" />
        <span className="font-semibold uppercase tracking-[0.18em]">
          Challenge
        </span>
      </div>
      <div className="flex min-w-[200px] max-w-[380px] flex-col justify-center bg-black/70 px-3 py-2">
        <span className="truncate text-[11px] font-medium text-white">
          {selected?.title ?? "Aucun challenge sélectionné"}
        </span>
        {typeof selected?.target === "number" && (
          <span className={`text-[10px] ${colorClass}`}>
            {selected.current ?? 0}/{selected.target} {selected.unit ?? ""}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 rounded-r-xl bg-black/80 px-3 py-2">
        {typeof selected?.target === "number" ? (
          <>
            <span className={`text-lg font-semibold tabular-nums ${colorClass}`}>
              {selected.current ?? 0}
            </span>
            <span className="text-[10px] text-white/50">sur</span>
            <span className="text-sm font-medium text-white tabular-nums">
              {selected.target}
            </span>
          </>
        ) : (
          <span className="text-[11px] text-white/70">Progression libre</span>
        )}
        {selected?.skinImageUrl && (
          <div className="relative ml-2 h-8 w-24 overflow-hidden rounded-lg bg-black/60 ring-1 ring-white/10">
            <Image
              src={selected.skinImageUrl}
              alt={selected.title}
              fill
              className="object-contain"
            />
          </div>
        )}
      </div>
    </div>
  )
}

