"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"

import { getOverlayPresetTheme, type OverlayPreset } from "@/lib/overlay/presets"

type TalkMessage = {
  id: string
  displayName: string
  color?: string
  text: string
}

function normalizeChannel(input: string) {
  let ch = input.trim()
  ch = ch.replace(/^@/, "")
  ch = ch.replace(/^https?:\/\/(www\.)?twitch\.tv\//i, "")
  ch = ch.split("/")[0] ?? ""
  return ch.toLowerCase()
}

const MAX_MESSAGES = 6

export function OverlayTalkChat({
  channel,
  preset = "default",
}: {
  channel?: string
  preset?: OverlayPreset
}) {
  const [messages, setMessages] = React.useState<TalkMessage[]>([])
  const [channelNormalized, setChannelNormalized] = React.useState<string>("")
  const visual = getOverlayPresetTheme(preset)

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
          target: string,
          tags: Record<string, string> | undefined,
          message: string,
          self: boolean,
        ) => {
          if (disconnected || self) return
          const text = message?.trim()
          if (!text) return

          const displayName = tags?.["display-name"] ?? tags?.username ?? target
          const color = tags?.color
          const id = tags?.id ?? `${Date.now()}-${Math.random()}`

          setMessages((prev) => {
            const next = [...prev, { id, displayName, color, text }]
            if (next.length > MAX_MESSAGES) {
              return next.slice(next.length - MAX_MESSAGES)
            }
            return next
          })
        },
      )

      await client.connect()
    }

    start().catch(() => {
      // ignore connection errors in OBS
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
  }, [channelNormalized])

  return (
    <div className="pointer-events-none select-none h-full w-full overflow-hidden">
      <div className={visual.panelClassName}>
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-10 rounded-t-2xl blur-2xl"
          style={{ backgroundImage: visual.topGlowGradient }}
        />

        <div className="relative mb-2 flex items-center justify-between gap-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
            Talk tranquille
          </div>
          <div className="shrink-0 text-[10px] font-mono text-white/35">
            {channelNormalized ? `@${channelNormalized}` : ""}
          </div>
        </div>

        <div className="relative flex min-h-0 flex-1 flex-col justify-end gap-1.5">
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="rounded-xl bg-black/35 px-3 py-2 ring-1 ring-white/10"
              >
                <div className="text-[12px] font-mono font-semibold" style={{ color: m.color ?? "#c4b5fd" }}>
                  {m.displayName}
                </div>
                <div className="mt-0.5 text-[14px] leading-snug text-white/90">{m.text}</div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

