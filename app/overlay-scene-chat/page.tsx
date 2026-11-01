import type { Metadata } from "next"

import { OverlayBodyMode } from "@/components/overlay/overlay-body-mode"
import { OverlaySceneChat } from "@/components/overlay/overlay-scene-chat"
import { parseOverlayPreset } from "@/lib/overlay/presets"

export const metadata: Metadata = {
  title: "Overlay Scène Chat",
}

export default async function OverlaySceneChatPage({
  searchParams,
}: {
  searchParams?: Promise<{
    channel?: string
    preset?: string
    coopstreamKey?: string
  }>
}) {
  const sp = searchParams ? await searchParams : undefined
  const channel =
    typeof sp?.channel === "string" && sp.channel.trim() ? sp.channel.trim() : undefined
  const coopstreamKey =
    typeof sp?.coopstreamKey === "string" && sp.coopstreamKey.trim()
      ? sp.coopstreamKey.trim()
      : undefined
  const preset = parseOverlayPreset(sp?.preset)

  return (
    <div className="h-dvh w-dvw bg-transparent pointer-events-none">
      <OverlayBodyMode />
      <OverlaySceneChat
        channel={channel}
        coopstreamKey={coopstreamKey}
        preset={preset}
      />
    </div>
  )
}
