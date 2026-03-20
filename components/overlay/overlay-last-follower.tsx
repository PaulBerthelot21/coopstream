"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Heart } from "lucide-react"

function normalizeChannel(input: string) {
  let ch = input.trim()
  ch = ch.replace(/^@/, "")
  ch = ch.replace(/^https?:\/\/(www\.)?twitch\.tv\//i, "")
  ch = ch.split("/")[0] ?? ""
  return ch.toLowerCase()
}

function formatRelativeFr(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  const diffMs = Date.now() - d.getTime()
  const sec = Math.floor(diffMs / 1000)
  if (sec < 45) return "à l’instant"
  const min = Math.floor(sec / 60)
  if (min < 60) return `il y a ${min} min`
  const h = Math.floor(min / 60)
  if (h < 48) return `il y a ${h} h`
  const days = Math.floor(h / 24)
  return `il y a ${days} j`
}

type ApiOk = {
  follower: {
    login: string
    displayName: string
    followedAt: string
  } | null
  total?: number
}

const POLL_MS = 30_000

export function OverlayLastFollower({
  channel,
}: {
  channel?: string
}) {
  const [channelNormalized, setChannelNormalized] = React.useState<string>("")
  const [displayName, setDisplayName] = React.useState<string | null>(null)
  const [relative, setRelative] = React.useState<string>("")
  const [total, setTotal] = React.useState<number | undefined>(undefined)
  const [status, setStatus] = React.useState<
    "idle" | "loading" | "ok" | "no_config" | "error"
  >("idle")
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

  const fetchFollower = React.useCallback(async () => {
    if (!channelNormalized) return
    if (!hasLoadedRef.current) {
      setStatus("loading")
    }

    try {
      const res = await fetch(
        `/api/twitch/last-follower?channel=${encodeURIComponent(channelNormalized)}`,
        { cache: "no-store" },
      )

      if (res.status === 503) {
        hasLoadedRef.current = true
        setStatus("no_config")
        setDisplayName(null)
        setRelative("")
        setTotal(undefined)
        return
      }

      if (!res.ok) {
        hasLoadedRef.current = true
        setStatus("error")
        setDisplayName(null)
        setRelative("")
        setTotal(undefined)
        return
      }

      const data = (await res.json()) as ApiOk
      hasLoadedRef.current = true
      setStatus("ok")
      setTotal(data.total)

      if (!data.follower) {
        setDisplayName(null)
        setRelative("")
        return
      }

      setDisplayName(data.follower.displayName || data.follower.login)
      setRelative(formatRelativeFr(data.follower.followedAt))
    } catch {
      hasLoadedRef.current = true
      setStatus("error")
      setDisplayName(null)
      setRelative("")
      setTotal(undefined)
    }
  }, [channelNormalized])

  React.useEffect(() => {
    void fetchFollower()
  }, [fetchFollower])

  React.useEffect(() => {
    if (!channelNormalized) return
    const id = window.setInterval(() => {
      void fetchFollower()
    }, POLL_MS)
    return () => window.clearInterval(id)
  }, [channelNormalized, fetchFollower])

  const subtitle =
    status === "no_config"
      ? "API Twitch (variables d’environnement)"
      : status === "error"
        ? "Erreur API"
        : status === "loading" && displayName === null
          ? "Chargement…"
          : ""

  return (
    <div className="pointer-events-none select-none h-full w-full overflow-hidden">
      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl bg-black/70 px-4 py-3 ring-1 ring-white/10 backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-10 rounded-t-2xl bg-gradient-to-r from-sky-500/20 via-transparent to-violet-500/20 blur-2xl" />

        <div className="relative mb-2 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Heart
              className="h-3.5 w-3.5 shrink-0 text-rose-400/90"
              aria-hidden
              strokeWidth={2.5}
            />
            <div className="min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
                Dernier follower
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
              key={displayName ?? "empty"}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
              className="flex flex-col gap-1"
            >
              <div className="font-mono text-lg font-semibold leading-tight text-white drop-shadow-[0_0_12px_rgba(0,0,0,0.85)]">
                {displayName ?? (status === "loading" ? "…" : "—")}
              </div>
              {relative ? (
                <div className="text-[11px] text-white/55">{relative}</div>
              ) : subtitle ? (
                <div className="text-[11px] text-white/40">{subtitle}</div>
              ) : null}
              {typeof total === "number" && status === "ok" && (
                <div className="mt-0.5 text-[10px] text-white/35">
                  {total.toLocaleString("fr-FR")}{" "}
                  {total > 1 ? "abonnés" : "abonné"} au total
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
