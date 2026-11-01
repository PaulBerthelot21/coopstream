import type { Metadata } from "next"

import { OverlayTwitchChat } from "../../components/overlay/overlay-twitch-chat"
import { OverlayBodyMode } from "@/components/overlay/overlay-body-mode"
import { parseOverlayPreset } from "@/lib/overlay/presets"

export const metadata: Metadata = {
  title: "Overlay Chat",
}

export default async function OverlayChatPage({
  searchParams,
}: {
  searchParams?: Promise<{
    channel?: string
    preset?: string
    sound?: string
    soundUrl?: string
    volume?: string
  }>
}) {
  const sp = searchParams ? await searchParams : undefined

  const channelFromQuery =
    typeof sp?.channel === "string" && sp.channel.trim()
      ? sp.channel.trim()
      : undefined
  const presetFromQuery = parseOverlayPreset(sp?.preset)

  const soundRaw = typeof sp?.sound === "string" ? sp.sound.trim().toLowerCase() : ""
  const sound = !(soundRaw === "0" || soundRaw === "false" || soundRaw === "off")
  const soundUrl =
    typeof sp?.soundUrl === "string" && sp.soundUrl.trim()
      ? sp.soundUrl.trim()
      : undefined
  const volumeRaw = typeof sp?.volume === "string" ? Number(sp.volume) : NaN
  const soundVolume =
    Number.isFinite(volumeRaw) && volumeRaw >= 0 && volumeRaw <= 1
      ? volumeRaw
      : 0.55

  return (
    <div className="flex h-dvh w-dvw items-start justify-end bg-transparent pointer-events-none pr-6 pt-6">
      <OverlayBodyMode />
      <div className="w-[420px] max-w-[45vw] h-[50vh] max-h-[540px]">
        <OverlayTwitchChat
          channel={channelFromQuery}
          preset={presetFromQuery}
          maxMessages={32}
          sound={sound}
          soundUrl={soundUrl}
          soundVolume={soundVolume}
        />
      </div>
    </div>
  )
}
