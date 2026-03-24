"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Heart, Sparkles } from "lucide-react"
import { getOverlayPresetTheme, type OverlayPreset } from "@/lib/overlay/presets"

function normalizeChannel(input: string) {
  let ch = input.trim()
  ch = ch.replace(/^@/, "")
  ch = ch.replace(/^https?:\/\/(www\.)?twitch\.tv\//i, "")
  ch = ch.split("/")[0] ?? ""
  return ch.toLowerCase()
}

type ApiOk = {
  follower: {
    login: string
    displayName: string
    followedAt: string
  } | null
  total?: number
}

type ToastState = {
  id: string
  login: string
  displayName: string
  followedAt: string
}

const POLL_MS = 15_000
const TOAST_MS = 5_000
const IS_DEV = process.env.NODE_ENV !== "production"

export function OverlayNewFollowerToast({
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
  const lastFollowedAtRef = React.useRef<string | null>(null)
  const lastLoginRef = React.useRef<string | null>(null)
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

  const fetchFollower = React.useCallback(async () => {
    if (!channelNormalized) return

    const qp = new URLSearchParams({ channel: channelNormalized })
    const key = coopstreamKey?.trim()
    if (key) qp.set("coopstreamKey", key)

    const res = await fetch(`/api/twitch/last-follower?${qp.toString()}`, {
      cache: "no-store",
    })

    if (res.status === 503) return
    if (!res.ok) return

    const data = (await res.json()) as ApiOk
    const follower = data.follower
    if (!follower) return

    const followedAt = follower.followedAt
    const login = follower.login

    // Baseline: on initialise une fois sans déclencher d'animation.
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true
      lastFollowedAtRef.current = followedAt
      lastLoginRef.current = login
      return
    }

    const prevFollowedAt = lastFollowedAtRef.current
    const prevLogin = lastLoginRef.current

    // Déclenche le toast uniquement si ça change (nouveau follow).
    if (prevFollowedAt !== followedAt || prevLogin !== login) {
      lastFollowedAtRef.current = followedAt
      lastLoginRef.current = login

      setToast({
        id: `${Date.now()}`,
        login,
        displayName: follower.displayName || follower.login,
        followedAt,
      })
    }
  }, [channelNormalized, coopstreamKey])

  const triggerDevToast = React.useCallback(() => {
    const followedAt = new Date().toISOString()
    const login = "dev_follower"
    const displayName = "Dev follower"
    lastFollowedAtRef.current = followedAt
    lastLoginRef.current = login
    setToast({
      id: `${Date.now()}`,
      login,
      displayName,
      followedAt,
    })
  }, [])

  React.useEffect(() => {
    if (!channelNormalized) return

    // Reset l'état quand le channel change.
    hasInitializedRef.current = false
    lastFollowedAtRef.current = null
    lastLoginRef.current = null
    setToast(null)

    void fetchFollower()

    const id = window.setInterval(() => {
      void fetchFollower()
    }, POLL_MS)

    return () => window.clearInterval(id)
  }, [channelNormalized, fetchFollower])

  // Auto-dismiss du toast pour garder un overlay propre.
  React.useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), TOAST_MS)
    return () => window.clearTimeout(t)
  }, [toast])
  const visual = getOverlayPresetTheme(preset)
  const toastPanelClassName =
    preset === "lecalme"
      ? "relative overflow-hidden rounded-2xl border-2 border-violet-400/70 bg-black/90 px-4 py-3 ring-1 ring-violet-300/35 backdrop-blur-md"
      : "relative overflow-hidden rounded-2xl bg-black/75 px-4 py-3 ring-1 ring-white/10 backdrop-blur-xl"

  return (
    <div className="pointer-events-none select-none relative h-full w-full overflow-hidden">
      {IS_DEV ? (
        <button
          type="button"
          onClick={triggerDevToast}
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
            className="absolute left-1/2 top-4 w-[340px] max-w-[92%] -translate-x-1/2"
          >
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
                      Nouveau follower
                    </div>
                    <div className="mt-1 truncate font-mono text-sm font-semibold text-white drop-shadow-[0_0_10px_rgba(0,0,0,0.85)]">
                      {toast.displayName}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-white/40">
                      <Heart className={visual.heartIconClassName} strokeWidth={2.5} />
                      <span className="truncate">@{toast.login}</span>
                    </div>
                  </div>
                </div>
                <div className="shrink-0 text-[10px] font-mono text-white/35">
                  live
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

