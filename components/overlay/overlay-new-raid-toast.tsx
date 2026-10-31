"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Heart, Sparkles } from "lucide-react"
import { getOverlayPresetTheme, type OverlayPreset } from "@/lib/overlay/presets"
import { OverlayNewRaidRebrand } from "@/components/overlay/overlay-new-raid-rebrand"
import { useOverlayTestEvent } from "@/lib/overlay/use-overlay-test-event"

function normalizeChannel(input: string) {
  let ch = input.trim()
  ch = ch.replace(/^@/, "")
  ch = ch.replace(/^https?:\/\/(www\.)?twitch\.tv\//i, "")
  ch = ch.split("/")[0] ?? ""
  return ch.toLowerCase()
}

type ToastState = {
  id: string
  displayName: string
  viewers?: number
}

const TOAST_MS = 6_000
const IS_DEV = process.env.NODE_ENV !== "production"
const EVENTSUB_WS = "wss://eventsub.wss.twitch.tv/ws"

export function OverlayNewRaidToast({
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

  const triggerDevToast = React.useCallback((displayName = "Dev raider") => {
    setToast({
      id: `${Date.now()}`,
      displayName,
      viewers: 42,
    })
  }, [])

  useOverlayTestEvent("raid", (event) => {
    triggerDevToast(event.displayName)
  }, coopstreamKey)

  React.useEffect(() => {
    if (!channelNormalized) return

    let closed = false
    let ws: WebSocket | null = null
    let reconnectTimer: number | null = null

    const connect = () => {
      if (closed) return
      ws = new WebSocket(EVENTSUB_WS)

      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(String(ev.data)) as {
            metadata?: { message_type?: string }
            payload?: {
              session?: { id?: string }
              event?: {
                from_broadcaster_user_name?: string
                from_broadcaster_user_login?: string
                viewers?: number
              }
            }
          }

          const type = msg.metadata?.message_type
          if (type === "session_welcome") {
            const sessionId = msg.payload?.session?.id
            if (!sessionId) return
            void (async () => {
              try {
                await fetch("/api/twitch/eventsub/raid", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    sessionId,
                    channel: channelNormalized,
                    coopstreamKey: coopstreamKey?.trim() || undefined,
                  }),
                })
              } catch {
                // ignore — overlay reste utilisable via Test toast
              }
            })()
            return
          }

          if (type === "notification") {
            const event = msg.payload?.event
            if (!event) return
            const displayName =
              event.from_broadcaster_user_name ||
              event.from_broadcaster_user_login ||
              "Raid"
            setToast({
              id: `${Date.now()}`,
              displayName,
              viewers:
                typeof event.viewers === "number" ? event.viewers : undefined,
            })
          }
        } catch {
          // ignore malformed frames
        }
      }

      ws.onclose = () => {
        if (closed) return
        reconnectTimer = window.setTimeout(connect, 3000)
      }
    }

    connect()

    return () => {
      closed = true
      if (reconnectTimer != null) window.clearTimeout(reconnectTimer)
      try {
        ws?.close()
      } catch {
        // ignore
      }
    }
  }, [channelNormalized, coopstreamKey])

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
              <OverlayNewRaidRebrand visual={visual} displayName={toast.displayName} />
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
                        Nouveau raid
                      </div>
                      <div className="mt-1 truncate font-mono text-sm font-semibold text-white drop-shadow-[0_0_10px_rgba(0,0,0,0.85)]">
                        {toast.displayName}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-white/40">
                        <Heart className={visual.heartIconClassName} strokeWidth={2.5} />
                        <span className="truncate">
                          {typeof toast.viewers === "number"
                            ? `${toast.viewers} viewers`
                            : "bienvenue"}
                        </span>
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
