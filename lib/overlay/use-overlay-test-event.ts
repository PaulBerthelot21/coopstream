"use client"

import * as React from "react"

import {
  OVERLAY_TEST_CHANNEL,
  OVERLAY_TEST_STORAGE_KEY,
  type OverlayTestEvent,
  type OverlayTestKind,
} from "@/lib/overlay/test-events"

const POLL_MS = 1200

/**
 * Écoute les events de test (BroadcastChannel + localStorage + poll API)
 * pour déclencher un toast sur l’overlay OBS / navigateur.
 */
export function useOverlayTestEvent(
  kind: OverlayTestKind,
  onEvent: (event: OverlayTestEvent) => void,
  scopeKey?: string,
) {
  const onEventRef = React.useRef(onEvent)
  onEventRef.current = onEvent
  const lastSeenAtRef = React.useRef(0)
  const scope = scopeKey?.trim() || "global"

  React.useEffect(() => {
    const handle = (event: OverlayTestEvent) => {
      if (event.kind !== kind) return
      if (event.at <= lastSeenAtRef.current) return
      lastSeenAtRef.current = event.at
      onEventRef.current(event)
    }

    let bc: BroadcastChannel | null = null
    try {
      bc = new BroadcastChannel(OVERLAY_TEST_CHANNEL)
      bc.onmessage = (ev) => {
        const data = ev.data as OverlayTestEvent
        if (data?.kind && data?.at) handle(data)
      }
    } catch {
      // ignore
    }

    const onStorage = (ev: StorageEvent) => {
      if (ev.key !== OVERLAY_TEST_STORAGE_KEY || !ev.newValue) return
      try {
        handle(JSON.parse(ev.newValue) as OverlayTestEvent)
      } catch {
        // ignore
      }
    }
    window.addEventListener("storage", onStorage)

    const poll = async () => {
      try {
        const qp = new URLSearchParams({
          scopeKey: scope,
          since: String(lastSeenAtRef.current),
        })
        const res = await fetch(`/api/overlay/test?${qp.toString()}`, {
          cache: "no-store",
        })
        if (!res.ok) return
        const data = (await res.json()) as { event: OverlayTestEvent | null }
        if (data.event) handle(data.event)
      } catch {
        // ignore
      }
    }

    void poll()
    const id = window.setInterval(() => {
      void poll()
    }, POLL_MS)

    return () => {
      window.clearInterval(id)
      window.removeEventListener("storage", onStorage)
      try {
        bc?.close()
      } catch {
        // ignore
      }
    }
  }, [kind, scope])
}
