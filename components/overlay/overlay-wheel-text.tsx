"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import { getOverlayPresetTheme, type OverlayPreset } from "@/lib/overlay/presets"

export function OverlayWheelText({
  coopstreamKey,
  preset = "default",
}: {
  coopstreamKey?: string
  preset?: OverlayPreset
}) {
  const [status, setStatus] = React.useState<
    "idle" | "loading" | "ok" | "error" | "no_config"
  >("idle")
  const [selectedText, setSelectedText] = React.useState<string>("")
  const [spinDegrees, setSpinDegrees] = React.useState<number>(0)
  const [spinNonce, setSpinNonce] = React.useState<number>(0)
  const [spinDone, setSpinDone] = React.useState<boolean>(false)

  React.useEffect(() => {
    let alive = true
    if (!coopstreamKey || !coopstreamKey.trim()) {
      setStatus("no_config")
      setSelectedText("")
      return
    }

    const load = async () => {
      try {
        setStatus("loading")
        const res = await fetch(
          `/api/coopstream/rooms/${encodeURIComponent(coopstreamKey)}/wheel-items/draw`,
          { cache: "no-store" },
        )
        if (!res.ok) {
          if (!alive) return
          setStatus("error")
          setSelectedText("")
          return
        }

        const data = (await res.json()) as {
          text?: string | null
          spinDegrees?: number
        }

        if (!alive) return

        const text = data?.text ?? null
        if (!text) {
          setStatus("no_config")
          setSelectedText("")
          return
        }

        setStatus("ok")
        setSelectedText(text)
        setSpinDegrees(Number(data?.spinDegrees ?? 0))
        setSpinNonce((n) => n + 1)
        setSpinDone(false)

        // Le spinner doit "finir" au même rythme que l'animation.
        window.setTimeout(() => {
          if (!alive) return
          setSpinDone(true)
        }, 2800)
      } catch {
        if (!alive) return
        setStatus("error")
        setSelectedText("")
      }
    }

    void load()

    return () => {
      alive = false
    }
  }, [coopstreamKey])

  const visual = getOverlayPresetTheme(preset)
  const wheelBaseClass =
    "flex items-center justify-center rounded-full ring-1 ring-white/10 shadow-[0_0_30px_rgba(79,70,229,0.25)]"

  return (
    <div className="pointer-events-none select-none relative h-full w-full">
      <div className={visual.panelClassName}>
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-10 rounded-t-2xl blur-2xl"
          style={{ backgroundImage: visual.topGlowGradient }}
        />

        <div className="relative z-10 flex w-full items-center justify-between gap-3 mb-3">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
              <Sparkles className={visual.sparkleIconClassName} strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
                Roulette
              </div>
            </div>
          </div>
          <div className="shrink-0 text-[10px] font-mono text-white/35">
            {status === "loading" ? "..." : "live"}
          </div>
        </div>

        <div className="relative z-10 flex flex-1 items-center justify-center w-full">
          <div className="relative w-[78%] max-w-[320px] aspect-square">
            <div className="pointer-events-none absolute top-[-6px] left-1/2 -translate-x-1/2 z-20">
              <div className="h-0 w-0 border-l-[8px] border-r-[8px] border-b-[14px] border-l-transparent border-r-transparent border-b-white/80" />
            </div>

            <AnimatePresence mode="popLayout" initial={false}>
              {status === "ok" ? (
                <motion.div
                  key={spinNonce}
                  initial={{ rotate: 0 }}
                  animate={{ rotate: spinDegrees }}
                  transition={{
                    duration: 2.8,
                    ease: [0.2, 0.8, 0.2, 1],
                  }}
                  className={`absolute inset-0 ${wheelBaseClass}`}
                  style={{ backgroundImage: visual.wheelGradient }}
                >
                  <div className="absolute inset-2 rounded-full ring-1 ring-white/10 bg-black/15" />
                  <div className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 ring-1 ring-white/15" />
                </motion.div>
              ) : (
                <div
                  className={`absolute inset-0 ${wheelBaseClass}`}
                  style={{ backgroundImage: visual.wheelGradient }}
                />
              )}
            </AnimatePresence>

            <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center px-4 text-center">
              <AnimatePresence mode="wait" initial={false}>
                {status === "loading" ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="font-mono text-sm font-semibold text-white/80"
                  >
                    Tirage…
                  </motion.div>
                ) : null}

                {spinDone && status === "ok" ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.22 }}
                    className="font-mono text-sm font-semibold text-white drop-shadow-[0_0_18px_rgba(0,0,0,0.55)]"
                  >
                    {selectedText}
                  </motion.div>
                ) : null}

                {status === "no_config" ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-mono text-sm font-semibold text-white/40"
                  >
                    —
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

