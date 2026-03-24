"use client"

import * as React from "react"

import { OverlayCarousel } from "@/components/overlay/overlay-carousel"
import { OverlayBodyMode } from "@/components/overlay/overlay-body-mode"
import { parseOverlayPreset, type OverlayPreset } from "@/lib/overlay/presets"

import type { Challenge } from "@/lib/types/challenge"

export default function OverlayDefiCarrouselPage() {
  const [coopstreamKey, setCoopstreamKey] = React.useState<string>("")
  const [preset, setPreset] = React.useState<OverlayPreset>("default")

  const [challenges, setChallenges] = React.useState<Challenge[]>([])
  const POLL_MS = 4000

  React.useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search)
      setCoopstreamKey(sp.get("coopstreamKey")?.trim() ?? "")
      setPreset(parseOverlayPreset(sp.get("preset") ?? undefined))
    } catch {
      setCoopstreamKey("")
      setPreset("default")
    }
  }, [])

  React.useEffect(() => {
    if (!coopstreamKey) return

    let alive = true

    const load = async () => {
      try {
        const res = await fetch(
          `/api/coopstream/rooms/${encodeURIComponent(coopstreamKey)}`,
          { cache: "no-store" },
        )

        if (!res.ok) return

        const data = (await res.json()) as {
          challenges?: Challenge[]
        }
        if (!alive) return
        setChallenges(data.challenges ?? [])
      } catch {
        // overlay OBS: on ignore les erreurs réseau
      }
    }

    void load()
    const id = window.setInterval(() => {
      void load()
    }, POLL_MS)

    return () => {
      alive = false
      window.clearInterval(id)
    }
  }, [coopstreamKey])

  const ordered = React.useMemo(() => {
    return [...challenges].sort(
      (a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0),
    )
  }, [challenges])

  return (
    <div className="flex h-dvh w-dvw items-start justify-end bg-transparent pt-6 pr-2">
      <OverlayBodyMode />
      <div className="w-full max-w-xl">
        <OverlayCarousel challenges={ordered} preset={preset} />
      </div>
    </div>
  )
}
