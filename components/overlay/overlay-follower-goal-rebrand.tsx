"use client"

import * as React from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import type { OverlayPresetTheme } from "@/lib/overlay/presets"

type Props = {
  visual: OverlayPresetTheme
  headerText: string
  current: number | undefined
  target: number | null
  unit: string
  subtitle: string
  channelNormalized: string
  coopstreamKey?: string
  goalLoaded: boolean
  goalError: boolean
  progressPercent: number
}

export function OverlayFollowerGoalRebrand({
  visual,
  headerText,
  current,
  target,
  unit,
  subtitle,
  channelNormalized,
  coopstreamKey,
  goalLoaded,
  goalError,
  progressPercent,
}: Props) {
  const bg = visual.assets?.backgroundUrl
  const chibi = visual.assets?.chibiUrl
  const accent = visual.accentColor ?? "#ffc4a8"
  const hasTarget = typeof target === "number"
  const hasCurrent = typeof current === "number"
  const showBar = hasTarget && hasCurrent

  const hint = subtitle
    ? subtitle
    : hasTarget
      ? null
      : !coopstreamKey?.trim()
        ? "coopstreamKey requis"
        : goalError
          ? "Erreur API"
          : !goalLoaded
            ? "Chargement…"
            : "Objectif non défini"

  const currentLabel = hasCurrent ? current.toLocaleString("fr-FR") : "—"
  const targetLabel = hasTarget ? target.toLocaleString("fr-FR") : "—"

  return (
    <div className="pointer-events-none relative h-full w-full select-none overflow-visible">
      <div className="absolute inset-y-[6%] left-[17%] right-0">
        <div
          className={visual.panelClassName}
          style={{
            boxShadow:
              "0 0 0 1.5px rgba(236,240,255,0.9), 0 14px 36px rgba(0,0,0,0.55)",
          }}
        >
          {bg ? (
            <Image
              src={bg}
              alt=""
              fill
              priority
              className="object-cover"
              sizes="520px"
            />
          ) : null}

          <div className="pointer-events-none absolute inset-0 bg-[#0c061c]/45" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0c061c]/55 via-transparent to-[#0c061c]/15" />

          <div className="relative z-10 flex h-full flex-col items-center justify-center pl-[24%] pr-6 pt-2 pb-3">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`${headerText}-${targetLabel}-${currentLabel}-${hint ?? "ok"}`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="flex w-full flex-col items-center text-center"
              >
                <div className="flex w-full max-w-[96%] items-center gap-2.5">
                  <div
                    className="h-[2px] min-w-[18px] flex-1 rounded-full"
                    style={{
                      backgroundColor: accent,
                      boxShadow: `0 0 8px ${accent}`,
                    }}
                  />
                  <div
                    className="shrink-0 text-[11px] font-black uppercase leading-none tracking-[0.18em] text-white"
                    style={{ textShadow: "0 2px 10px rgba(0,0,0,0.85)" }}
                  >
                    {headerText}
                  </div>
                  <div
                    className="h-[2px] min-w-[18px] flex-1 rounded-full"
                    style={{
                      backgroundColor: accent,
                      boxShadow: `0 0 8px ${accent}`,
                    }}
                  />
                </div>

                <div
                  className="mt-0.5 font-black leading-none tracking-tight text-white"
                  style={{ textShadow: "0 3px 14px rgba(0,0,0,0.9)" }}
                >
                  <span className="text-[40px] tabular-nums">{currentLabel}</span>
                  <span className="mx-1 text-[26px] text-white/75">/</span>
                  <span className="text-[40px] tabular-nums">{targetLabel}</span>
                </div>

                <div
                  className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.32em] text-white/85"
                  style={{ textShadow: "0 1px 6px rgba(0,0,0,0.8)" }}
                >
                  {unit}
                </div>

                {hint ? (
                  <div className="mt-1 text-[10px] text-white/45">{hint}</div>
                ) : null}

                <div className="mt-2.5 w-full max-w-[94%]">
                  <div className="h-[11px] w-full overflow-hidden rounded-full border border-white/85 bg-black/75">
                    <motion.div
                      className="h-full rounded-full"
                      initial={false}
                      animate={{ width: showBar ? `${progressPercent.toFixed(1)}%` : "0%" }}
                      transition={{ type: "spring", stiffness: 120, damping: 20 }}
                      style={{ backgroundImage: visual.progressGradient }}
                    />
                  </div>
                </div>

                <div
                  className="mt-2 text-[9px] font-semibold uppercase tracking-[0.38em] text-white/80"
                  style={{ textShadow: "0 1px 6px rgba(0,0,0,0.75)" }}
                >
                  LE CALME
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {chibi ? (
        <div className="absolute -left-[1%] top-1/2 z-20 h-[112%] w-[44%] -translate-y-[52%]">
          <Image
            src={chibi}
            alt="Le Calme"
            fill
            priority
            className="object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.7)]"
            sizes="240px"
          />
        </div>
      ) : null}

      {channelNormalized ? (
        <div className="absolute bottom-0 right-1 z-30 text-[9px] font-mono text-white/20">
          @{channelNormalized}
        </div>
      ) : null}
    </div>
  )
}
