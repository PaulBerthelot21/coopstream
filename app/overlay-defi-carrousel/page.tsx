"use client"

import * as React from "react"

import { OverlayCarousel } from "@/components/overlay/overlay-carousel"

import type { Challenge } from "@/lib/types/challenge"

export default function OverlayDefiCarrouselPage() {
  const [coopstreamKey, setCoopstreamKey] = React.useState<string>("")

  const [challenges, setChallenges] = React.useState<Challenge[]>([])
  const POLL_MS = 4000

  React.useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search)
      setCoopstreamKey(sp.get("coopstreamKey")?.trim() ?? "")
    } catch {
      setCoopstreamKey("")
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
    <div className="flex h-dvh w-dvw items-start justify-end bg-transparent pt-6 pr-6">
      <div className="w-full max-w-xl">
        <OverlayCarousel challenges={ordered} />
      </div>
    </div>
  )
}
