"use client"

import * as React from "react"

import { useBroadcastSync } from "@/lib/sync/useBroadcastSync"
import { useCoopStreamPersistence } from "@/lib/sync/useCoopStreamPersistence"
import { useCoopStreamStore } from "@/lib/store/coopstream"
import { OverlayCarousel } from "@/components/overlay/overlay-carousel"

export default function OverlayDefiCarrouselPage() {
  useBroadcastSync()
  useCoopStreamPersistence()

  const challengesMap = useCoopStreamStore((s) => s.challenges)
  const challenges = React.useMemo(
    () =>
      Object.values(challengesMap).sort(
        (a, b) => b.updatedAt - a.updatedAt,
      ),
    [challengesMap],
  )

  return (
    <div className="flex h-dvh w-dvw items-start justify-end bg-transparent pt-6 pr-6">
      <div className="w-full max-w-xl">
        <OverlayCarousel challenges={challenges} />
      </div>
    </div>
  )
}
