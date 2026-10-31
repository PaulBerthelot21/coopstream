import type { OverlayTestEvent } from "@/lib/overlay/test-events"

type Store = {
  byKey: Map<string, OverlayTestEvent>
}

const globalForStore = globalThis as unknown as {
  __coopstreamOverlayTestStore?: Store
}

function getStore(): Store {
  if (!globalForStore.__coopstreamOverlayTestStore) {
    globalForStore.__coopstreamOverlayTestStore = { byKey: new Map() }
  }
  return globalForStore.__coopstreamOverlayTestStore
}

const TTL_MS = 30_000

export function setOverlayTestEvent(scopeKey: string, event: OverlayTestEvent) {
  getStore().byKey.set(scopeKey || "global", event)
}

export function getOverlayTestEvent(scopeKey: string): OverlayTestEvent | null {
  const event = getStore().byKey.get(scopeKey || "global")
  if (!event) return null
  if (Date.now() - event.at > TTL_MS) {
    getStore().byKey.delete(scopeKey || "global")
    return null
  }
  return event
}
