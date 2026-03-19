"use client"

import * as React from "react"

import { subscribeToEvents } from "@/lib/sync/broadcast"
import { useCoopStreamStore } from "@/lib/store/coopstream"

export function useBroadcastSync() {
  const applyEvent = useCoopStreamStore((s) => s.applyEvent)

  React.useEffect(() => {
    return subscribeToEvents((event) => applyEvent(event))
  }, [applyEvent])
}

