"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Heart, Sparkles } from "lucide-react"
import { getOverlayPresetTheme, type OverlayPreset } from "@/lib/overlay/presets"
import { OverlayNewSubRebrand } from "@/components/overlay/overlay-new-sub-rebrand"
import { useOverlayTestEvent } from "@/lib/overlay/use-overlay-test-event"

function normalizeChannel(input: string) {
  let ch = input.trim()
  ch = ch.replace(/^@/, "")
  ch = ch.replace(/^https?:\/\/(www\.)?twitch\.tv\//i, "")
  ch = ch.split("/")[0] ?? ""
  return ch.toLowerCase()
}

type ApiOk = {
  subscribers: Array<{
    id: string
    login: string
    displayName: string
    tier: string | null
    isGift: boolean
  }>
  total?: number
}

type ToastState = {
  id: string
  login: string
  displayName: string
}

const POLL_MS = 15_000
const TOAST_MS = 5_000
const IS_DEV = process.env.NODE_ENV !== "production"

export function OverlayNewSubToast({
  channel,
  coopstreamKey,
  preset = "default",
}: {
  channel?: string
  coopstreamKey?: string
  preset?: OverlayPreset
}) {
  const [channelNormalized, setChannelNormalized] = React.useState<string>("")
  const [toast, setToast] = React.useState<ToastState | null>(null)
  const knownIdsRef = React.useRef<Set<string> | null>(null)
  const hasInitializedRef = React.useRef(false)

  React.useEffect(() => {
    const STORAGE_KEY = "coopstream-twitch-channel"
    const fallback = "anthemtv_"

    const applyFromLocalStorage = () => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        setChannelNormalized(normalizeChannel(raw || fallback))
      } catch {
        setChannelNormalized(normalizeChannel(fallback))
      }
    }

    if (channel && channel.trim()) {
      setChannelNormalized(normalizeChannel(channel))
      return
    }

    applyFromLocalStorage()
    const id = window.setInterval(applyFromLocalStorage, 2000)
    return () => window.clearInterval(id)
  }, [channel])

  const fetchSubs = React.useCallback(async () => {
    if (!channelNormalized) return

    const qp = new URLSearchParams({ channel: channelNormalized })
    const key = coopstreamKey?.trim()
    if (key) qp.set("coopstreamKey", key)

    const res = await fetch(`/api/twitch/last-subscriber?${qp.toString()}`, {
      cache: "no-store",
    })

    if (res.status === 503) return
    if (!res.ok) return

    const data = (await res.json()) as ApiOk
    const list = data.subscribers ?? []

    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true
      knownIdsRef.current = new Set(list.map((s) => s.id))
      return
    }

    const known = knownIdsRef.current ?? new Set<string>()
    const newcomers = list.filter((s) => !known.has(s.id))
    for (const s of list) known.add(s.id)
    knownIdsRef.current = known

    if (newcomers.length === 0) return

    const newest = newcomers[newcomers.length - 1]
    setToast({
      id: `${Date.now()}`,
      login: newest.login,
      displayName: newest.displayName || newest.login,
    })
  }, [channelNormalized, coopstreamKey])

  const triggerDevToast = React.useCallback((displayName = "Dev sub") => {
    setToast({
      id: `${Date.now()}`,
      login: "dev_sub",
      displayName,
    })
  }, [])

  useOverlayTestEvent("sub", (event) => {
    triggerDevToast(event.displayName)
  }, coopstreamKey)

  React.useEffect(() => {
    if (!channelNormalized) return

    hasInitializedRef.current = false
    knownIdsRef.current = null
    setToast(null)

    void fetchSubs()

    const id = window.setInterval(() => {
      void fetchSubs()
    }, POLL_MS)

    return () => window.clearInterval(id)
  }, [channelNormalized, fetchSubs])

  React.useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), TOAST_MS)
    return () => window.clearTimeout(t)
  }, [toast])

  const visual = getOverlayPresetTheme(preset)
  const isRebrand = preset === "lecalme-rebrand"
  const toastPanelClassName =
    preset === "lecalme"
      ? "relative overflow-hidden rounded-2xl border-2 border-violet-400/70 bg-black/90 px-4 py-3 ring-1 ring-violet-300/35 backdrop-blur-md"
      : "relative overflow-hidden rounded-2xl bg-black/75 px-4 py-3 ring-1 ring-white/10 backdrop-blur-xl"

  return (
    <div
      className={[
        "pointer-events-none relative h-full w-full select-none",
        isRebrand ? "overflow-visible" : "overflow-hidden",
      ].join(" ")}
    >
      {IS_DEV ? (
        <button
          type="button"
          onClick={() => triggerDevToast()}
          className="pointer-events-auto fixed left-4 top-4 z-[9999] rounded-lg bg-black/60 px-3 py-2 text-xs font-medium text-white ring-1 ring-white/20 backdrop-blur hover:bg-black/75"
        >
          Test toast
        </button>
      ) : null}
      <AnimatePresence mode="popLayout">
        {toast ? (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -14, scale: 0.98 }}
            transition={{ duration: 0.28 }}
            className={
              isRebrand
                ? "absolute left-1/2 top-2 w-[480px] max-w-[96%] -translate-x-1/2 overflow-visible"
                : "absolute left-1/2 top-4 w-[340px] max-w-[92%] -translate-x-1/2"
            }
          >
            {isRebrand ? (
              <OverlayNewSubRebrand visual={visual} displayName={toast.displayName} />
            ) : (
              <div className={toastPanelClassName}>
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-10 rounded-t-2xl blur-2xl"
                  style={{ backgroundImage: visual.topGlowGradient }}
                />

                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
                      <Sparkles className={visual.sparkleIconClassName} strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
                        Nouveau sub
                      </div>
                      <div className="mt-1 truncate font-mono text-sm font-semibold text-white drop-shadow-[0_0_10px_rgba(0,0,0,0.85)]">
                        {toast.displayName}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-white/40">
                        <Heart className={visual.heartIconClassName} strokeWidth={2.5} />
                        <span className="truncate">merci</span>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 text-[10px] font-mono text-white/35">live</div>
                </div>
              </div>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
