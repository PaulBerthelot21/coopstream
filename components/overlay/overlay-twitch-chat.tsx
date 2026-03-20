"use client"

/* eslint-disable @next/next/no-img-element */

import * as React from "react"

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
}: {
  channel?: string
  maxMessages?: number
}) {
  const [messages, setMessages] = React.useState<TwitchChatMessage[]>([])
  const [channelNormalized, setChannelNormalized] = React.useState<string>("")
  const listRef = React.useRef<HTMLDivElement | null>(null)

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

  return (
    <div className="pointer-events-none select-none h-full w-full overflow-hidden">
      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl bg-black/70 px-4 py-3 ring-1 ring-white/10 backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-10 rounded-t-2xl bg-gradient-to-r from-sky-500/20 via-transparent to-violet-500/20 blur-2xl" />

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

