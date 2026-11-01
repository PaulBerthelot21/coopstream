import type { Metadata } from "next"

import { OverlayBodyMode } from "@/components/overlay/overlay-body-mode"
import { OverlayPlanning } from "@/components/overlay/overlay-planning"
import { parseOverlayPreset } from "@/lib/overlay/presets"

export const metadata: Metadata = {
  title: "Overlay Planning",
}

export default async function OverlayPlanningPage({
  searchParams,
}: {
  searchParams?: Promise<{
    channel?: string
    coopstreamKey?: string
    preset?: string
    limit?: string
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
  const limitRaw = typeof sp?.limit === "string" ? Number(sp.limit) : NaN
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(3, Math.floor(limitRaw)) : 3

  return (
    <div className="flex h-dvh w-dvw items-end justify-start bg-transparent pointer-events-none px-6 py-6">
      <OverlayBodyMode />
      <div className="w-[380px] max-w-[46vw]">
        <OverlayPlanning
          channel={channel}
          coopstreamKey={coopstreamKey}
          preset={preset}
          limit={limit}
        />
      </div>
    </div>
  )
}
