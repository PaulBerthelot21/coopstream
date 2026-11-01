import type { Metadata } from "next"

import { OverlayBodyMode } from "@/components/overlay/overlay-body-mode"
import { OverlayPause } from "@/components/overlay/overlay-pause"
import { parseOverlayPreset } from "@/lib/overlay/presets"

export const metadata: Metadata = {
  title: "Overlay Pause",
}

export default async function OverlayPausePage({
  searchParams,
}: {
  searchParams?: Promise<{
    title?: string
    subtitle?: string
    fx?: string
    preset?: string
    coopstreamKey?: string
    channel?: string
  }>
}) {
  const sp = searchParams ? await searchParams : undefined
  const title = typeof sp?.title === "string" ? sp.title.trim() : ""
  const subtitle = typeof sp?.subtitle === "string" ? sp.subtitle.trim() : ""
  const fx =
    sp?.fx === "off" || sp?.fx === "low" || sp?.fx === "high" || sp?.fx === "medium"
      ? sp.fx
      : "medium"
  const preset = parseOverlayPreset(sp?.preset)
  const coopstreamKey =
    typeof sp?.coopstreamKey === "string" && sp.coopstreamKey.trim()
      ? sp.coopstreamKey.trim()
      : undefined
  const channel =
    typeof sp?.channel === "string" && sp.channel.trim() ? sp.channel.trim() : undefined

  return (
    <div className="h-dvh w-dvw bg-transparent pointer-events-none">
      <OverlayBodyMode />
      <OverlayPause
        title={title || "Pause"}
        subtitle={subtitle}
        fx={fx}
        preset={preset}
        coopstreamKey={coopstreamKey}
        channel={channel}
      />
    </div>
  )
}
