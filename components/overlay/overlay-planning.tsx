"use client"

import * as React from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import { CalendarDays } from "lucide-react"
import { getOverlayPresetTheme, type OverlayPreset } from "@/lib/overlay/presets"

function normalizeChannel(input: string) {
  let ch = input.trim()
  ch = ch.replace(/^@/, "")
  ch = ch.replace(/^https?:\/\/(www\.)?twitch\.tv\//i, "")
  ch = ch.split("/")[0] ?? ""
  return ch.toLowerCase()
}

type Segment = {
  id: string
  title: string
  startTime: string
  endTime: string
  category: string | null
}

const POLL_MS = 60_000

function formatDayFr(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  })
}

function formatTimeFr(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
}

export function OverlayPlanning({
  channel,
  coopstreamKey,
  preset = "default",
  limit = 3,
}: {
  channel?: string
  coopstreamKey?: string
  preset?: OverlayPreset
  limit?: number
}) {
  const visual = getOverlayPresetTheme(preset)
  const accent = visual.accentColor ?? "#a78bfa"
  const marbleBg = visual.assets?.backgroundUrl
  const isRebrand = preset === "lecalme-rebrand"

  const [channelNormalized, setChannelNormalized] = React.useState("")
  const [segments, setSegments] = React.useState<Segment[]>([])
  const [status, setStatus] = React.useState<"idle" | "loading" | "ok" | "empty" | "error" | "no_config">(
    "idle",
  )

  React.useEffect(() => {
    const STORAGE_KEY = "coopstream-twitch-channel"
    const fallback = "anthemtv_"
    const apply = () => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        setChannelNormalized(normalizeChannel(channel?.trim() || raw || fallback))
      } catch {
        setChannelNormalized(normalizeChannel(channel?.trim() || fallback))
      }
    }
    if (channel?.trim()) {
      setChannelNormalized(normalizeChannel(channel))
      return
    }
    apply()
    const id = window.setInterval(apply, 2000)
    return () => window.clearInterval(id)
  }, [channel])

  const fetchSchedule = React.useCallback(async () => {
    if (!channelNormalized) return
    setStatus((prev) => (prev === "ok" || prev === "empty" ? prev : "loading"))
    try {
      const qp = new URLSearchParams({ channel: channelNormalized })
      const key = coopstreamKey?.trim()
      if (key) qp.set("coopstreamKey", key)
      const res = await fetch(`/api/twitch/schedule?${qp.toString()}`, { cache: "no-store" })
      if (res.status === 503) {
        setStatus("no_config")
        setSegments([])
        return
      }
      if (!res.ok) {
        setStatus("error")
        setSegments([])
        return
      }
      const data = (await res.json()) as { segments?: Segment[]; empty?: boolean }
      const next = (data.segments ?? []).slice(0, Math.max(1, limit))
      setSegments(next)
      setStatus(next.length === 0 || data.empty ? "empty" : "ok")
    } catch {
      setStatus("error")
      setSegments([])
    }
  }, [channelNormalized, coopstreamKey, limit])

  React.useEffect(() => {
    void fetchSchedule()
  }, [fetchSchedule])

  React.useEffect(() => {
    if (!channelNormalized) return
    const id = window.setInterval(() => void fetchSchedule(), POLL_MS)
    return () => window.clearInterval(id)
  }, [channelNormalized, fetchSchedule])

  const hint =
    status === "no_config"
      ? "Jeton Twitch requis"
      : status === "error"
        ? "Erreur API"
        : status === "loading"
          ? "Chargement…"
          : status === "empty"
            ? "Aucun stream planifié"
            : null

  if (isRebrand) {
    return (
      <div className="pointer-events-none relative w-full select-none">
        <div
          className="relative flex w-full flex-col overflow-hidden rounded-[28px] border-[3px] border-[#2a1f5c] bg-[#1a1035]"
          style={{
            boxShadow:
              "0 0 0 1.5px rgba(236,240,255,0.95), 0 14px 36px rgba(0,0,0,0.55)",
          }}
        >
          <div className="pointer-events-none absolute inset-[3px] overflow-hidden rounded-[24px]">
            {marbleBg ? (
              <Image
                src={marbleBg}
                alt=""
                fill
                className="object-cover"
                sizes="420px"
                unoptimized
              />
            ) : null}
            <div className="absolute inset-0 bg-[#0c061c]/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0c061c]/28 via-transparent to-[#0c061c]/18" />
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[2] rounded-[28px]"
            style={{ boxShadow: "inset 0 0 0 1px rgba(236,240,255,0.4)" }}
          />

          <div className="relative z-10 flex flex-col gap-2.5 px-4 py-3.5">
            <div className="flex w-full items-center gap-2">
              <div
                className="h-[2px] min-w-[12px] flex-1 rounded-full"
                style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}` }}
              />
              <div
                className="shrink-0 text-[11px] font-black uppercase tracking-[0.2em] text-white"
                style={{ textShadow: "0 2px 10px rgba(0,0,0,0.85)" }}
              >
                Planning
              </div>
              <div
                className="h-[2px] min-w-[12px] flex-1 rounded-full"
                style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}` }}
              />
            </div>

            {hint ? (
              <div className="flex min-h-[96px] items-center justify-center text-center text-sm text-white/50">
                {hint}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <AnimatePresence initial={false}>
                  {segments.map((s, i) => (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: i * 0.04 }}
                      className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2.5"
                      style={{
                        boxShadow: `inset 0 0 0 1px ${accent}18, 0 8px 18px rgba(0,0,0,0.3)`,
                      }}
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <div
                          className="text-[11px] font-bold uppercase tracking-[0.14em]"
                          style={{ color: accent }}
                        >
                          {formatDayFr(s.startTime)}
                        </div>
                        <div className="text-[12px] font-semibold tabular-nums text-white/70">
                          {formatTimeFr(s.startTime)}
                          <span className="text-white/35"> – </span>
                          {formatTimeFr(s.endTime)}
                        </div>
                      </div>
                      <div
                        className="mt-1 truncate text-[16px] font-black tracking-tight text-white"
                        style={{ textShadow: "0 2px 10px rgba(0,0,0,0.85)" }}
                      >
                        {s.title}
                      </div>
                      {s.category ? (
                        <div className="mt-0.5 text-[11px] font-medium text-white/45">
                          {s.category}
                        </div>
                      ) : null}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pointer-events-none w-full select-none overflow-hidden">
      <div className={`${visual.panelClassName} !h-auto`}>
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-10 rounded-t-2xl blur-2xl"
          style={{ backgroundImage: visual.topGlowGradient }}
        />

        <div className="relative mb-2 flex items-center gap-2">
          <CalendarDays className={`h-4 w-4 ${visual.sparkleIconClassName}`} />
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
            Planning
          </div>
        </div>

        <div className="relative flex flex-col gap-1.5">
          {hint ? (
            <div className="flex min-h-[72px] items-center justify-center text-sm text-white/45">
              {hint}
            </div>
          ) : (
            segments.map((s) => (
              <div
                key={s.id}
                className="rounded-xl bg-black/35 px-3 py-2 ring-1 ring-white/10"
              >
                <div className="flex items-baseline justify-between gap-2 text-[11px] text-white/55">
                  <span className="font-semibold uppercase tracking-wide">
                    {formatDayFr(s.startTime)}
                  </span>
                  <span className="tabular-nums">
                    {formatTimeFr(s.startTime)} – {formatTimeFr(s.endTime)}
                  </span>
                </div>
                <div className="mt-0.5 text-[14px] font-semibold text-white/90">{s.title}</div>
                {s.category ? (
                  <div className="mt-0.5 text-[11px] text-white/45">{s.category}</div>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
