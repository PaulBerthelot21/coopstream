import type { Metadata } from "next"

import { OverlayNewFollowerToast } from "@/components/overlay/overlay-new-follower-toast"
import { OverlayBodyMode } from "@/components/overlay/overlay-body-mode"
import { parseOverlayPreset } from "@/lib/overlay/presets"

export const metadata: Metadata = {
  title: "Overlay Nouveau follower",
}

export default async function OverlayNewFollowerPage({
  searchParams,
}: {
  searchParams?: Promise<{
    channel?: string
    coopstreamKey?: string
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
  const coopstreamKeyFromQuery =
    typeof sp?.coopstreamKey === "string" && sp.coopstreamKey.trim()
      ? sp.coopstreamKey.trim()
      : undefined
  const presetFromQuery = parseOverlayPreset(sp?.preset)
  const isRebrand = presetFromQuery === "lecalme-rebrand"

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
      : 0.7

  return (
    <div className="flex h-dvh w-dvw items-start justify-end bg-transparent pointer-events-none pr-6 pt-6">
      <OverlayBodyMode />
      <div
        className={
          isRebrand
            ? "h-[180px] w-[520px] max-w-[92vw] overflow-visible"
            : "w-[420px] max-w-[45vw] h-[40vh] max-h-[380px]"
        }
      >
        <OverlayNewFollowerToast
          channel={channelFromQuery}
          coopstreamKey={coopstreamKeyFromQuery}
          preset={presetFromQuery}
          sound={sound}
          soundUrl={soundUrl}
          soundVolume={soundVolume}
        />
      </div>
    </div>
  )
}
