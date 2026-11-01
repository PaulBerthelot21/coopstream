import type { Metadata } from "next"

import { OverlayBodyMode } from "@/components/overlay/overlay-body-mode"
import { OverlayIntro } from "@/components/overlay/overlay-intro"
import { parseOverlayPreset } from "@/lib/overlay/presets"

export const metadata: Metadata = {
  title: "Overlay Intro",
}

export default async function OverlayIntroPage({
  searchParams,
}: {
  searchParams?: Promise<{
    seconds?: string
    subtitle?: string
    fx?: string
    preset?: string
    coopstreamKey?: string
    channel?: string
  }>
}) {
  const sp = searchParams ? await searchParams : undefined
  const raw = sp?.seconds
  const parsed = typeof raw === "string" ? Number(raw) : NaN
  const startSeconds = Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 300
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
      <OverlayIntro
        startSeconds={startSeconds}
        subtitle={subtitle}
        fx={fx}
        preset={preset}
        coopstreamKey={coopstreamKey}
        channel={channel}
      />
    </div>
  )
}
