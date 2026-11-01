import type { Metadata } from "next"

import { OverlayBodyMode } from "@/components/overlay/overlay-body-mode"
import {
  OverlaySceneChat,
  type SceneChatLayer,
} from "@/components/overlay/overlay-scene-chat"
import { parseOverlayPreset } from "@/lib/overlay/presets"

export const metadata: Metadata = {
  title: "Overlay Scène Chat",
}

function parseSceneChatLayer(raw?: string | null): SceneChatLayer {
  if (raw === "frame" || raw === "chat" || raw === "bg") return raw
  return "preview"
}

export default async function OverlaySceneChatPage({
  searchParams,
}: {
  searchParams?: Promise<{
    channel?: string
    preset?: string
    coopstreamKey?: string
    layer?: string
    sound?: string
    soundUrl?: string
    volume?: string
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
  const layer = parseSceneChatLayer(sp?.layer)

  const soundRaw = typeof sp?.sound === "string" ? sp.sound.trim().toLowerCase() : ""
  const chatSound = !(soundRaw === "0" || soundRaw === "false" || soundRaw === "off")
  const chatSoundUrl =
    typeof sp?.soundUrl === "string" && sp.soundUrl.trim()
      ? sp.soundUrl.trim()
      : undefined
  const volumeRaw = typeof sp?.volume === "string" ? Number(sp.volume) : NaN
  const chatSoundVolume =
    Number.isFinite(volumeRaw) && volumeRaw >= 0 && volumeRaw <= 1
      ? volumeRaw
      : 0.55

  return (
    <div className="h-dvh w-dvw bg-transparent pointer-events-none">
      <OverlayBodyMode />
      <OverlaySceneChat
        channel={channel}
        coopstreamKey={coopstreamKey}
        preset={preset}
        layer={layer}
        chatSound={chatSound}
        chatSoundUrl={chatSoundUrl}
        chatSoundVolume={chatSoundVolume}
      />
    </div>
  )
}
