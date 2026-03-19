import { COOPSTREAM_CHANNEL, type CoopStreamEvent } from "@/lib/types/events"

let channel: BroadcastChannel | null = null

export function getBroadcastChannel() {
  if (typeof window === "undefined") return null
  if (!("BroadcastChannel" in window)) return null
  channel ??= new BroadcastChannel(COOPSTREAM_CHANNEL)
  return channel
}

export function publishEvent(event: CoopStreamEvent) {
  const bc = getBroadcastChannel()
  bc?.postMessage(event)
}

export function subscribeToEvents(onEvent: (event: CoopStreamEvent) => void) {
  const bc = getBroadcastChannel()
  if (!bc) return () => {}

  const handler = (message: MessageEvent) => {
    onEvent(message.data as CoopStreamEvent)
  }

  bc.addEventListener("message", handler)
  return () => bc.removeEventListener("message", handler)
}

