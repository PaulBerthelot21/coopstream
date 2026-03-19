"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"

import { useBroadcastSync } from "@/lib/sync/useBroadcastSync"
import { useCoopStreamPersistence } from "@/lib/sync/useCoopStreamPersistence"
import { selectSelectedChallenge, useCoopStreamStore } from "@/lib/store/coopstream"
import { OverlayBar } from "@/components/overlay/overlay-bar"
import { OverlayCard } from "@/components/overlay/overlay-card"
import { OverlayTicker } from "@/components/overlay/overlay-ticker"
import { OverlayNowPlaying } from "@/components/overlay/overlay-now-playing"
import { OverlayScoreboard } from "@/components/overlay/overlay-scoreboard"
import { OverlayPillStack } from "@/components/overlay/overlay-pill-stack"
import { OverlayTimeline } from "@/components/overlay/overlay-timeline"
import { OverlayCarousel } from "@/components/overlay/overlay-carousel"

export function OverlayView() {
  useBroadcastSync()
  useCoopStreamPersistence()

  const selected = useCoopStreamStore(selectSelectedChallenge)
  const challengesMap = useCoopStreamStore((s) => s.challenges)
  const challenges = React.useMemo(
    () =>
      Object.values(challengesMap).sort(
        (a, b) => b.updatedAt - a.updatedAt,
      ),
    [challengesMap],
  )
  const lastRewardText = useCoopStreamStore((s) => s.lastRewardText)
  const lastRewardAt = useCoopStreamStore((s) => s.lastRewardAt)

  const [rewardVisible, setRewardVisible] = React.useState(false)
  const [mode, setMode] = React.useState<
    | "bar"
    | "card"
    | "ticker"
    | "now-playing"
    | "scoreboard"
    | "stack"
    | "timeline"
    | "carousel"
  >("bar")

  React.useEffect(() => {
    if (!lastRewardAt || !lastRewardText) return
    setRewardVisible(true)
    const timeout = window.setTimeout(() => setRewardVisible(false), 3500)
    return () => window.clearTimeout(timeout)
  }, [lastRewardAt, lastRewardText])

  return (
    <div className="h-full w-full bg-transparent flex items-center justify-center">
      <div className="relative w-full max-w-5xl py-6 px-4">
        <div className="mb-3 flex flex-wrap justify-end gap-2 text-[11px]">
          <button
            type="button"
            onClick={() => setMode("bar")}
            className={
              "rounded-full px-3 py-1 transition " +
              (mode === "bar"
                ? "bg-white text-black"
                : "bg-black/60 text-white/70 ring-1 ring-white/20")
            }
          >
            Barre
          </button>
          <button
            type="button"
            onClick={() => setMode("card")}
            className={
              "rounded-full px-3 py-1 transition " +
              (mode === "card"
                ? "bg-white text-black"
                : "bg-black/60 text-white/70 ring-1 ring-white/20")
            }
          >
            Carte
          </button>
          <button
            type="button"
            onClick={() => setMode("ticker")}
            className={
              "rounded-full px-3 py-1 transition " +
              (mode === "ticker"
                ? "bg-white text-black"
                : "bg-black/60 text-white/70 ring-1 ring-white/20")
            }
          >
            Ticker
          </button>
          <button
            type="button"
            onClick={() => setMode("now-playing")}
            className={
              "rounded-full px-3 py-1 transition " +
              (mode === "now-playing"
                ? "bg-white text-black"
                : "bg-black/60 text-white/70 ring-1 ring-white/20")
            }
          >
            Now playing
          </button>
          <button
            type="button"
            onClick={() => setMode("scoreboard")}
            className={
              "rounded-full px-3 py-1 transition " +
              (mode === "scoreboard"
                ? "bg-white text-black"
                : "bg-black/60 text-white/70 ring-1 ring-white/20")
            }
          >
            Scoreboard
          </button>
          <button
            type="button"
            onClick={() => setMode("stack")}
            className={
              "rounded-full px-3 py-1 transition " +
              (mode === "stack"
                ? "bg-white text-black"
                : "bg-black/60 text-white/70 ring-1 ring-white/20")
            }
          >
            Stack
          </button>
          <button
            type="button"
            onClick={() => setMode("timeline")}
            className={
              "rounded-full px-3 py-1 transition " +
              (mode === "timeline"
                ? "bg-white text-black"
                : "bg-black/60 text-white/70 ring-1 ring-white/20")
            }
          >
            Timeline
          </button>
          <button
            type="button"
            onClick={() => setMode("carousel")}
            className={
              "rounded-full px-3 py-1 transition " +
              (mode === "carousel"
                ? "bg-white text-black"
                : "bg-black/60 text-white/70 ring-1 ring-white/20")
            }
          >
            Carrousel
          </button>
        </div>

        {mode === "bar" && <OverlayBar selected={selected} challenges={challenges} />}
        {mode === "card" && <OverlayCard selected={selected} />}
        {mode === "ticker" && (
          <OverlayTicker selected={selected} challenges={challenges} />
        )}
        {mode === "now-playing" && <OverlayNowPlaying selected={selected} />}
        {mode === "scoreboard" && <OverlayScoreboard selected={selected} />}
        {mode === "stack" && (
          <OverlayPillStack selected={selected} challenges={challenges} />
        )}
        {mode === "timeline" && (
          <OverlayTimeline selected={selected} challenges={challenges} />
        )}
        {mode === "carousel" && (
          <OverlayCarousel challenges={challenges} />
        )}

        <AnimatePresence>
          {rewardVisible && lastRewardText && (
            <motion.div
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <motion.div
                className="relative flex h-64 w-[720px] items-center justify-center overflow-hidden rounded-[40px] bg-gradient-to-br from-[#49b6ff] via-[#0f172a] to-[#7c3aed] ring-2 ring-white/40 shadow-[0_0_120px_rgba(0,0,0,1)]"
                initial={{ scale: 0.4, rotate: -10, filter: "blur(10px)" }}
                animate={{ scale: 1, rotate: 0, filter: "blur(0px)" }}
                exit={{ scale: 0.6, rotate: 8, filter: "blur(10px)" }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="pointer-events-none absolute inset-[-40%] animate-pulse bg-[radial-gradient(circle_at_0%_0%,rgba(255,255,255,0.25),transparent_55%),radial-gradient(circle_at_100%_100%,rgba(96,165,250,0.18),transparent_55%)]" />
                <motion.div
                  className="relative flex flex-col items-center gap-3 px-6 text-center"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.12, duration: 0.35 }}
                >
                  <div className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-100/85 drop-shadow-[0_0_20px_rgba(8,47,73,0.9)]">
                    Reward déclenchée
                  </div>
                  <div className="text-4xl font-semibold leading-tight text-white drop-shadow-[0_0_35px_rgba(15,23,42,1)]">
                    {lastRewardText}
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

