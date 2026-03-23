"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Target } from "lucide-react"

type ApiOk = {
  follower: {
    login: string
    displayName: string
    followedAt: string
  } | null
  total?: number
}

type RoomResponse = {
  followerGoalTitle?: string | null
  followerGoalTarget?: number | null
  followerGoalUnit?: string | null
}

function normalizeChannel(input: string) {
  let ch = input.trim()
  ch = ch.replace(/^@/, "")
  ch = ch.replace(/^https?:\/\/(www\.)?twitch\.tv\//i, "")
  ch = ch.split("/")[0] ?? ""
  return ch.toLowerCase()
}

const POLL_MS = 30_000
const ROOM_POLL_MS = 4000

export function OverlayFollowerGoal({
  channel,
  coopstreamKey,
}: {
  channel?: string
  coopstreamKey?: string
}) {
  const [channelNormalized, setChannelNormalized] = React.useState<string>("")
  const [followersTotal, setFollowersTotal] = React.useState<number | undefined>(undefined)
  const [status, setStatus] = React.useState<"idle" | "loading" | "ok" | "no_config" | "error">(
    "idle",
  )

  const [goalLoaded, setGoalLoaded] = React.useState(false)
  const [goalError, setGoalError] = React.useState(false)
  const [goalTitle, setGoalTitle] = React.useState<string | null>(null)
  const [goalTarget, setGoalTarget] = React.useState<number | null>(null)
  const [goalUnit, setGoalUnit] = React.useState<string | null>(null)

  const hasLoadedRef = React.useRef(false)

  React.useEffect(() => {
    hasLoadedRef.current = false
  }, [channelNormalized])

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

  const fetchFollowersTotal = React.useCallback(async () => {
    if (!channelNormalized) return
    if (!hasLoadedRef.current) setStatus("loading")

    try {
      const qp = new URLSearchParams({ channel: channelNormalized })
      const key = coopstreamKey?.trim()
      if (key) qp.set("coopstreamKey", key)

      const res = await fetch(`/api/twitch/last-follower?${qp.toString()}`, {
        cache: "no-store",
      })

      if (res.status === 503) {
        hasLoadedRef.current = true
        setStatus("no_config")
        setFollowersTotal(undefined)
        return
      }

      if (!res.ok) {
        hasLoadedRef.current = true
        setStatus("error")
        setFollowersTotal(undefined)
        return
      }

      const data = (await res.json()) as ApiOk
      hasLoadedRef.current = true
      setStatus("ok")
      setFollowersTotal(typeof data.total === "number" ? data.total : undefined)
    } catch {
      hasLoadedRef.current = true
      setStatus("error")
      setFollowersTotal(undefined)
    }
  }, [channelNormalized, coopstreamKey])

  React.useEffect(() => {
    void fetchFollowersTotal()
  }, [fetchFollowersTotal])

  React.useEffect(() => {
    if (!channelNormalized) return
    const id = window.setInterval(() => {
      void fetchFollowersTotal()
    }, POLL_MS)
    return () => window.clearInterval(id)
  }, [channelNormalized, fetchFollowersTotal])

  const fetchRoom = React.useCallback(async () => {
    const key = coopstreamKey?.trim()
    if (!key) return

    try {
      const res = await fetch(`/api/coopstream/rooms/${encodeURIComponent(key)}`, {
        cache: "no-store",
      })
      if (!res.ok) return

      const data = (await res.json()) as RoomResponse
      setGoalTitle(data.followerGoalTitle ?? null)
      setGoalTarget(
        typeof data.followerGoalTarget === "number" && Number.isFinite(data.followerGoalTarget)
          ? data.followerGoalTarget
          : null,
      )
      setGoalUnit(data.followerGoalUnit ?? null)
      setGoalLoaded(true)
      setGoalError(false)
    } catch {
      // ignore network errors (OBS overlay should stay alive)
      setGoalError(true)
      setGoalLoaded(true)
    }
  }, [coopstreamKey])

  React.useEffect(() => {
    if (!coopstreamKey?.trim()) {
      setGoalLoaded(false)
      setGoalError(false)
      return
    }
    setGoalLoaded(false)
    setGoalError(false)
    void fetchRoom()
    const id = window.setInterval(() => {
      void fetchRoom()
    }, ROOM_POLL_MS)
    return () => window.clearInterval(id)
  }, [coopstreamKey, fetchRoom])

  const subtitle =
    status === "no_config"
      ? "Jeton requis (connecte-toi ou passe `coopstreamKey`)"
      : status === "error"
        ? "Erreur API"
        : status === "loading"
          ? "Chargement…"
          : ""

  const target = goalTarget
  const unit = goalUnit?.trim() || "followers"
  const current = followersTotal

  const canCompute =
    typeof target === "number" && Number.isFinite(target) && typeof current === "number"

  const progressPercent = canCompute
    ? Math.max(0, Math.min(100, (current / target) * 100))
    : 0

  const headerText = goalTitle?.trim() ? goalTitle : "Objectif followers"

  return (
    <div className="pointer-events-none select-none h-full w-full overflow-hidden">
      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl bg-black/70 px-4 py-3 ring-1 ring-white/10 backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-10 rounded-t-2xl bg-gradient-to-r from-sky-500/20 via-transparent to-violet-500/20 blur-2xl" />

        <div className="relative mb-1 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Target className="h-3.5 w-3.5 shrink-0 text-violet-300/90" />
            <div className="min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
                Objectif followers
              </div>
            </div>
          </div>

          <div className="shrink-0 text-[10px] font-mono text-white/35">
            {channelNormalized ? `@${channelNormalized}` : ""}
          </div>
        </div>

        <div className="relative flex min-h-[3rem] flex-1 flex-col justify-center">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${goalTitle ?? "no-title"}-${goalTarget ?? "no-target"}-${status}-${followersTotal ?? "na"}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
              className="flex flex-col gap-1"
            >
              <div className="flex items-center gap-2">
                <div className="font-mono text-[16px] font-semibold leading-tight text-white drop-shadow-[0_0_12px_rgba(0,0,0,0.85)]">
                  {headerText}
                </div>
              </div>

              {subtitle ? (
                <div className="text-[11px] text-white/40">{subtitle}</div>
              ) : !coopstreamKey?.trim() ? (
                <div className="text-[11px] text-white/40">
                  coopstreamKey requis pour lire l’objectif.
                </div>
              ) : goalError ? (
                <div className="text-[11px] text-white/40">Erreur API (objectif)</div>
              ) : !goalLoaded ? (
                <div className="text-[11px] text-white/40">Chargement objectif…</div>
              ) : typeof goalTarget === "number" ? (
                <div className="text-[11px] text-white/55">
                  <span className="font-mono">
                    {typeof current === "number"
                      ? current.toLocaleString("fr-FR")
                      : "…"}
                  </span>{" "}
                  /{" "}
                  <span className="font-mono">{target?.toLocaleString("fr-FR")}</span>{" "}
                  {unit}
                </div>
              ) : (
                <div className="text-[11px] text-white/40">
                  Définis un objectif (titre + nombre) dans l’admin.
                </div>
              )}

              {typeof goalTarget === "number" &&
                typeof current === "number" && (
                  <div className="mt-0.5">
                    <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-lime-300"
                        style={{ width: `${progressPercent.toFixed(0)}%` }}
                      />
                    </div>
                  </div>
                )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

