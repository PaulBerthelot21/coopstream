"use client"

/* eslint-disable @next/next/no-img-element */

import * as React from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import { getOverlayPresetTheme, type OverlayPreset } from "@/lib/overlay/presets"
import { playAlertSound } from "@/lib/overlay/play-alert-sound"

type TwitchChatMessage = {
  id: string
  displayName: string
  color?: string
  parts: ChatMessagePart[]
}

type ChatMessagePart =
  | { type: "text"; text: string }
  | { type: "emote"; id: string; start: number; end: number }

function normalizeChannel(input: string) {
  let ch = input.trim()
  ch = ch.replace(/^@/, "")
  ch = ch.replace(/^https?:\/\/(www\.)?twitch\.tv\//i, "")
  // Keep only the first path segment in case a full URL is provided.
  ch = ch.split("/")[0] ?? ""
  return ch.toLowerCase()
}

function parseTwitchEmotes(emotesTag: unknown, message: string) {
  const ranges: Array<{ id: string; start: number; end: number }> = []
  const pushRange = (idRaw: unknown, startRaw: unknown, endRaw: unknown) => {
    const id = typeof idRaw === "string" ? idRaw.trim() : ""
    const start = typeof startRaw === "number" ? startRaw : Number(startRaw)
    const end = typeof endRaw === "number" ? endRaw : Number(endRaw)
    if (!id) return
    if (!Number.isFinite(start) || !Number.isFinite(end)) return
    ranges.push({ id, start, end })
  }

  // Normal (IRCv3 tag) format example:
  // "25:0-4/1902:6-10,11-15"
  if (typeof emotesTag === "string" && emotesTag) {
    const groups = emotesTag.split("/")
    for (const group of groups) {
      const [idRaw, rangesRaw] = group.split(":")
      const id = idRaw?.trim()
      if (!id || !rangesRaw) continue

      const pieces = rangesRaw.split(",")
      for (const piece of pieces) {
        const [startStr, endStr] = piece.split("-")
        const start = Number(startStr)
        const end = Number(endStr)
        if (!Number.isFinite(start) || !Number.isFinite(end)) continue
        ranges.push({ id, start, end })
      }
    }
  } else if (
    typeof emotesTag === "object" &&
    emotesTag !== null &&
    !Array.isArray(emotesTag)
  ) {
    // Some tmi builds can expose emotes as an object instead of the string
    // representation. We support common shapes.
    const obj = emotesTag as Record<string, unknown>
    for (const [id, occ] of Object.entries(obj)) {
      if (!id) continue

      if (typeof occ === "string") {
        // "0-4,10-15"
        const pieces = occ.split(",")
        for (const piece of pieces) {
          const [startStr, endStr] = piece.split("-")
          pushRange(id, startStr, endStr)
        }
        continue
      }

      if (Array.isArray(occ)) {
        for (const v of occ) {
          if (typeof v === "string") {
            const pieces = v.split(",")
            for (const piece of pieces) {
              const [startStr, endStr] = piece.split("-")
              pushRange(id, startStr, endStr)
            }
          } else if (typeof v === "object" && v !== null) {
            const maybe = v as Record<string, unknown>
            // { start: number, end: number }
            if (
              Object.prototype.hasOwnProperty.call(maybe, "start") &&
              Object.prototype.hasOwnProperty.call(maybe, "end")
            ) {
              pushRange(id, maybe.start, maybe.end)
            }
          }
        }
        continue
      }

      if (typeof occ === "object" && occ !== null) {
        const maybe = occ as Record<string, unknown>
        if (
          Object.prototype.hasOwnProperty.call(maybe, "start") &&
          Object.prototype.hasOwnProperty.call(maybe, "end")
        ) {
          pushRange(id, maybe.start, maybe.end)
        }
      }
    }
  }

  if (ranges.length === 0) return [{ type: "text" as const, text: message }]

  ranges.sort((a, b) => a.start - b.start)

  const parts: ChatMessagePart[] = []
  let idx = 0

  for (const r of ranges) {
    if (r.start > idx) {
      parts.push({ type: "text", text: message.slice(idx, r.start) })
    }
    parts.push({ type: "emote", id: r.id, start: r.start, end: r.end })
    idx = r.end + 1
  }

  if (idx < message.length) {
    parts.push({ type: "text", text: message.slice(idx) })
  }

  return parts
}

function getTwitchEmoteSrc(emoteId: string) {
  // Using the same CDN pattern described by many tmi.js tutorials:
  // https://static-cdn.jtvnw.net/emoticons/v1/[emote_id]/2.0
  return `https://static-cdn.jtvnw.net/emoticons/v1/${encodeURIComponent(
    emoteId,
  )}/2.0`
}

export function OverlayTwitchChat({
  channel,
  maxMessages = 16,
  preset = "default",
  sound = false,
  soundUrl,
  soundVolume = 0.35,
}: {
  channel?: string
  maxMessages?: number
  preset?: OverlayPreset
  /** Son à chaque message (défaut off — trop bruyant en live). `sound=1` dans l’URL. */
  sound?: boolean
  soundUrl?: string
  soundVolume?: number
}) {
  const [messages, setMessages] = React.useState<TwitchChatMessage[]>([])
  const [channelNormalized, setChannelNormalized] = React.useState<string>("")
  const listRef = React.useRef<HTMLDivElement | null>(null)
  const visual = getOverlayPresetTheme(preset)
  const soundRef = React.useRef({ sound, soundUrl, soundVolume })
  soundRef.current = { sound, soundUrl, soundVolume }

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

    // If the page provided an explicit channel (query param), prefer it.
    if (channel && channel.trim()) {
      setChannelNormalized(normalizeChannel(channel))
      return
    }

    applyFromLocalStorage()
    // Allow live updates from the /settings page without needing to reload OBS.
    const id = window.setInterval(applyFromLocalStorage, 2000)
    return () => window.clearInterval(id)
  }, [channel])

  // Reset de l'affichage quand on change de channel.
  React.useEffect(() => {
    setMessages([])
  }, [channelNormalized])

  React.useEffect(() => {
    type TmiMessageHandler = (
      target: string,
      tags: Record<string, string> | undefined,
      message: string,
      self: boolean,
    ) => void

    type TmiClient = {
      connect: () => Promise<void>
      disconnect: () => Promise<void> | void
      on: (event: "message", handler: TmiMessageHandler) => void
      removeAllListeners?: (event: "message") => void
    }

    type TmiClientCtor = new (options: unknown) => TmiClient

    let client: TmiClient | null = null
    let disconnected = false

    async function start() {
      // Dynamic import avoids any SSR / Node-only bundling issues.
      const mod = await import("tmi.js")
      const modShape = mod as unknown as {
        Client?: TmiClientCtor
        default?: { Client?: TmiClientCtor }
      }

      const ClientCtor = modShape.Client ?? modShape.default?.Client
      if (!ClientCtor) return

      if (!channelNormalized) return

      client = new ClientCtor({
        options: { debug: false },
        connection: { secure: true, reconnect: true },
        channels: [channelNormalized],
      })

      client.on(
        "message",
        (
          _target: string,
          tags: Record<string, string> | undefined,
          message: string,
          self: boolean,
        ) => {
          if (disconnected || self) return

          const displayName =
            tags?.["display-name"] ?? tags?.username ?? _target
          const color = tags?.color
          const id = tags?.id ?? `${Date.now()}-${Math.random()}`
          const parts = parseTwitchEmotes(
            // Depending on the tmi.js build/runtime, emotes can come as:
            // - tags.emotes (object mapping id -> positions)
            // - tags["emotes-raw"] (string mapping id -> positions)
            tags?.["emotes"] ?? tags?.["emotes-raw"],
            message,
          )

          const cfg = soundRef.current
          if (cfg.sound) {
            playAlertSound({
              kind: "chat",
              soundUrl: cfg.soundUrl,
              volume: cfg.soundVolume,
            })
          }

          setMessages((prev) => {
            const next = [
              ...prev,
              {
                id,
                displayName,
                color,
                parts,
              },
            ]
            if (next.length > maxMessages) {
              return next.slice(next.length - maxMessages)
            }
            return next
          })
        },
      )

      await client.connect()
    }

    start().catch(() => {
      // If Twitch connection fails (network, tmi browser build, wrong channel),
      // we just keep the overlay empty to avoid breaking the whole page.
    })

    return () => {
      disconnected = true
      if (client) {
        try {
          client.removeAllListeners?.("message")
        } catch {
          // ignore
        }
        try {
          client.disconnect?.()
        } catch {
          // ignore
        }
      }
    }
  }, [channelNormalized, maxMessages])

  // Assure un défilement vers le bas à chaque ajout de messages.
  React.useEffect(() => {
    const el = listRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages.length])

  const accent = visual.accentColor ?? "#ffc4a8"
  const marbleBg = visual.assets?.backgroundUrl
  const isRebrand = preset === "lecalme-rebrand"

  if (isRebrand) {
    return (
      <div className="pointer-events-none relative h-full w-full select-none">
        <div
          className="relative flex h-full w-full flex-col overflow-hidden rounded-[28px] border-[3px] border-[#2a1f5c] bg-[#1a1035]"
          style={{
            boxShadow:
              "0 0 0 1.5px rgba(236,240,255,0.95), 0 14px 36px rgba(0,0,0,0.55)",
          }}
        >
          {/* Marbre + voiles clipés à l’intérieur, bordure intacte */}
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

          <div className="relative z-10 flex h-full min-h-0 flex-col px-4 py-3.5">
            <div className="mb-2.5 flex w-full items-center gap-2">
              <div
                className="h-[2px] min-w-[12px] flex-1 rounded-full"
                style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}` }}
              />
              <div
                className="shrink-0 text-[11px] font-black uppercase tracking-[0.2em] text-white"
                style={{ textShadow: "0 2px 10px rgba(0,0,0,0.85)" }}
              >
                Chat
              </div>
              <div
                className="h-[2px] min-w-[12px] flex-1 rounded-full"
                style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}` }}
              />
            </div>
            <div
              ref={listRef}
              className="relative flex min-h-0 flex-1 flex-col justify-end gap-1.5 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              <AnimatePresence initial={false}>
                {messages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 backdrop-blur-sm"
                    style={{
                      boxShadow: `inset 0 0 0 1px ${accent}18, 0 8px 18px rgba(0,0,0,0.28)`,
                    }}
                  >
                    <div className="flex items-start gap-2.5">
                      <span
                        className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                        style={{
                          background: m.color ?? accent,
                          boxShadow: `0 0 10px ${m.color ?? accent}88`,
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div
                          className="text-[13px] font-black tracking-tight"
                          style={{
                            color: m.color ?? accent,
                            textShadow: "0 2px 8px rgba(0,0,0,0.85)",
                          }}
                        >
                          {m.displayName}
                        </div>
                        <div
                          className="mt-0.5 text-[14px] leading-snug break-words text-white/92"
                          style={{
                            textShadow: "0 2px 8px rgba(0,0,0,0.8)",
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {m.parts.map((p, idx) => {
                            if (p.type === "text") {
                              return <span key={`t-${idx}`}>{p.text}</span>
                            }
                            return (
                              <img
                                key={`e-${p.id}-${p.start}`}
                                src={getTwitchEmoteSrc(p.id)}
                                alt=""
                                className="inline-block h-5 w-auto align-text-bottom"
                                draggable={false}
                              />
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pointer-events-none select-none h-full w-full overflow-hidden">
      <div className={visual.panelClassName}>
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-10 rounded-t-2xl blur-2xl"
          style={{ backgroundImage: visual.topGlowGradient }}
        />

        <div className="relative mb-2 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
              Chat Twitch
            </div>
          </div>
          <div className="shrink-0 text-[10px] font-mono text-white/35">
            {channelNormalized ? `@${channelNormalized}` : ""}
          </div>
        </div>

        <div
          ref={listRef}
          className="relative flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className="flex items-start gap-2 leading-tight text-[15px] text-white/90"
            >
              <span
                className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
                style={{
                  background: m.color ?? "rgba(255,255,255,0.7)",
                  boxShadow: `0 0 10px rgba(0,0,0,0.7)`,
                }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2 min-w-0">
                  <span
                    className="shrink-0 font-mono text-[14px] font-semibold"
                    style={{
                      color: m.color ?? "rgba(255,255,255,0.95)",
                      textShadow: "0 0 8px rgba(0,0,0,0.7)",
                    }}
                  >
                    {m.displayName}
                  </span>
                  <span
                    className="min-w-0 flex-1 font-mono text-[14px] break-words"
                    style={{
                      textShadow: "0 0 8px rgba(0,0,0,0.7)",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {m.parts.map((p, idx) => {
                      if (p.type === "text") {
                        return <span key={`t-${idx}`}>{p.text}</span>
                      }

                      return (
                        <img
                          key={`e-${p.id}-${p.start}`}
                          src={getTwitchEmoteSrc(p.id)}
                          alt=""
                          className="inline-block h-5 w-auto align-text-bottom"
                          draggable={false}
                        />
                      )
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

