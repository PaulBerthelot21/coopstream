export type OverlayTestKind = "follow" | "sub" | "raid"

export type OverlayTestEvent = {
  id: string
  kind: OverlayTestKind
  displayName: string
  at: number
}

export const OVERLAY_TEST_CHANNEL = "coopstream-overlay-test"
export const OVERLAY_TEST_STORAGE_KEY = "coopstream-overlay-test-event"

export const OVERLAY_TEST_KINDS: {
  id: OverlayTestKind
  label: string
  description: string
}[] = [
  {
    id: "follow",
    label: "Nouveau follow",
    description: "Toast overlay-new-follower",
  },
  {
    id: "sub",
    label: "Nouveau sub",
    description: "Toast overlay-new-sub",
  },
  {
    id: "raid",
    label: "Nouveau raid",
    description: "Toast overlay-new-raid",
  },
]

export function createOverlayTestEvent(
  kind: OverlayTestKind,
  displayName?: string,
): OverlayTestEvent {
  const name = displayName?.trim() || defaultNameFor(kind)
  return {
    id: `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    kind,
    displayName: name,
    at: Date.now(),
  }
}

function defaultNameFor(kind: OverlayTestKind) {
  if (kind === "follow") return "TestFollower"
  if (kind === "sub") return "TestSub"
  return "TestRaider"
}

/** Publie un event côté navigateur (onglets même origine). */
export function publishOverlayTestEvent(event: OverlayTestEvent) {
  try {
    const bc = new BroadcastChannel(OVERLAY_TEST_CHANNEL)
    bc.postMessage(event)
    bc.close()
  } catch {
    // ignore
  }
  try {
    window.localStorage.setItem(OVERLAY_TEST_STORAGE_KEY, JSON.stringify(event))
  } catch {
    // ignore
  }
}
