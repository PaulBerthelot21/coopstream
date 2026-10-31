"use client"

import * as React from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import type { OverlayPresetTheme } from "@/lib/overlay/presets"

type Props = {
  visual: OverlayPresetTheme
  status: "idle" | "loading" | "ok" | "error" | "no_config"
  selectedText: string
  candidates: string[]
  spinNonce: number
  spinDone: boolean
}

const ROW_H = 56
const VISIBLE = 5
const SPIN_MS = 3200

function buildReel(candidates: string[], winner: string, nonce: number): string[] {
  const pool =
    candidates.length > 0
      ? candidates
      : [winner, "…", "…", "…", "…"]

  // Seed léger via nonce pour varier l’ordre entre tirages.
  const shuffled = [...pool].sort((a, b) => {
    const ha = (a.length * 31 + nonce) % 97
    const hb = (b.length * 17 + nonce * 3) % 97
    return ha - hb
  })

  const reel: string[] = []
  const loops = 8
  for (let i = 0; i < loops; i++) {
    for (const t of shuffled) reel.push(t)
  }
  // Place le gagnant pile au centre de la fenêtre.
  const centerOffset = Math.floor(VISIBLE / 2)
  while (reel.length < centerOffset + 1) reel.push(winner)
  reel.push(winner)
  // Quelques items après pour le masque bas.
  for (let i = 0; i < centerOffset + 2; i++) {
    reel.push(shuffled[i % shuffled.length] ?? "…")
  }
  return reel
}

export function OverlayWheelTextRebrand({
  visual,
  status,
  selectedText,
  candidates,
  spinNonce,
  spinDone,
}: Props) {
  const bg = visual.assets?.backgroundUrl
  const accent = visual.accentColor ?? "#ffc4a8"

  const reel = React.useMemo(
    () =>
      status === "ok" && selectedText
        ? buildReel(candidates, selectedText, spinNonce)
        : [],
    [candidates, selectedText, spinNonce, status],
  )

  const winnerIndex = React.useMemo(() => {
    if (!selectedText || reel.length === 0) return 0
    // Dernière occurrence du gagnant avant le padding final.
    let idx = -1
    for (let i = 0; i < reel.length - Math.floor(VISIBLE / 2) - 1; i++) {
      if (reel[i] === selectedText) idx = i
    }
    return idx >= 0 ? idx : Math.max(0, reel.length - Math.floor(VISIBLE / 2) - 3)
  }, [reel, selectedText])

  const targetY = -(winnerIndex - Math.floor(VISIBLE / 2)) * ROW_H
  const viewportH = ROW_H * VISIBLE

  return (
    <div className="pointer-events-none relative h-full w-full select-none overflow-hidden">
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
            unoptimized
          />
        ) : null}

        <div className="pointer-events-none absolute inset-0 bg-[#0c061c]/52" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0c061c]/3 via-transparent to-[#0c061c]/6" />

        <div className="relative z-10 flex h-full flex-col px-5 pb-5 pt-4">
          <div className="flex w-full items-center gap-2.5">
            <div
              className="h-[2px] min-w-[18px] flex-1 rounded-full"
              style={{
                backgroundColor: accent,
                boxShadow: `0 0 8px ${accent}`,
              }}
            />
            <div
              className="shrink-0 text-[12px] font-black uppercase leading-none tracking-[0.22em] text-white"
              style={{ textShadow: "0 2px 10px rgba(0,0,0,0.85)" }}
            >
              Roulette
            </div>
            <div
              className="h-[2px] min-w-[18px] flex-1 rounded-full"
              style={{
                backgroundColor: accent,
                boxShadow: `0 0 8px ${accent}`,
              }}
            />
          </div>

          <div className="relative mt-4 flex flex-1 flex-col items-center justify-center">
            <div
              className="relative w-full max-w-[420px] overflow-hidden rounded-2xl border-[3px] border-[#2a1f5c] bg-black/45"
              style={{
                height: viewportH,
                boxShadow: `0 0 0 1.5px rgba(236,240,255,0.85), inset 0 0 40px rgba(0,0,0,0.45)`,
              }}
            >
              {/* Fondue haut / bas */}
              <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-10 bg-gradient-to-b from-[#0c061c]/90 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-10 bg-gradient-to-t from-[#0c061c]/90 to-transparent" />

              {/* Fenêtre centrale */}
              <div
                className="pointer-events-none absolute inset-x-2 z-10 rounded-xl"
                style={{
                  top: Math.floor(VISIBLE / 2) * ROW_H + 2,
                  height: ROW_H - 4,
                  boxShadow: `inset 0 0 0 2px ${accent}, 0 0 18px ${accent}55`,
                }}
              />

              <AnimatePresence mode="wait" initial={false}>
                {status === "loading" ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex h-full items-center justify-center text-sm font-black uppercase tracking-[0.18em] text-white/80"
                  >
                    Tirage…
                  </motion.div>
                ) : null}

                {status === "ok" && reel.length > 0 ? (
                  <motion.div
                    key={spinNonce}
                    className="absolute inset-x-0 top-0"
                    initial={{ y: 0 }}
                    animate={{ y: targetY }}
                    transition={{
                      duration: SPIN_MS / 1000,
                      ease: [0.12, 0.75, 0.12, 1],
                    }}
                  >
                    {reel.map((label, i) => {
                      const isWinner = spinDone && i === winnerIndex
                      return (
                        <div
                          key={`${spinNonce}-${i}`}
                          className="flex items-center justify-center px-4 text-center"
                          style={{ height: ROW_H }}
                        >
                          <span
                            className={[
                              "max-w-full truncate text-[17px] font-black tracking-tight",
                              isWinner ? "text-white" : "text-white/55",
                            ].join(" ")}
                            style={{
                              textShadow: isWinner
                                ? "0 2px 14px rgba(0,0,0,0.95)"
                                : "0 1px 8px rgba(0,0,0,0.7)",
                            }}
                          >
                            {label}
                          </span>
                        </div>
                      )
                    })}
                  </motion.div>
                ) : null}

                {status === "no_config" || status === "error" ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex h-full items-center justify-center text-sm font-semibold text-white/45"
                  >
                    {status === "error" ? "Erreur" : "—"}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            {spinDone && status === "ok" ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 max-w-[420px] px-2 text-center text-[13px] font-bold uppercase tracking-[0.16em] text-white/85"
                style={{ textShadow: "0 2px 10px rgba(0,0,0,0.85)" }}
              >
                {selectedText}
              </motion.div>
            ) : (
              <div className="mt-4 h-[20px]" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export const WHEEL_REBRAND_SPIN_MS = SPIN_MS
