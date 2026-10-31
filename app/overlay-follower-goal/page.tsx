import type { Metadata } from "next"

import { OverlayBodyMode } from "@/components/overlay/overlay-body-mode"
import { OverlayFollowerGoal } from "@/components/overlay/overlay-follower-goal"
import { parseOverlayPreset } from "@/lib/overlay/presets"

export const metadata: Metadata = {
  title: "Overlay Objectif followers",
}

export default async function OverlayFollowerGoalPage({
  searchParams,
}: {
  searchParams?: Promise<{
    channel?: string
    coopstreamKey?: string
    preset?: string
    demo?: string
  }>
}) {
  const sp = searchParams ? await searchParams : undefined

  const channelFromQuery =
    typeof sp?.channel === "string" && sp.channel.trim() ? sp.channel.trim() : undefined

  const coopstreamKeyFromQuery =
    typeof sp?.coopstreamKey === "string" && sp.coopstreamKey.trim()
      ? sp.coopstreamKey.trim()
      : undefined
  const presetFromQuery = parseOverlayPreset(sp?.preset)
  const isRebrand = presetFromQuery === "lecalme-rebrand"
  const demo = sp?.demo === "1" || sp?.demo === "true"

  return (
    <div className="flex h-dvh w-dvw items-start justify-end bg-transparent pointer-events-none pr-6 pt-6">
      <OverlayBodyMode />
      <div
        className={
          isRebrand
            ? "h-[168px] w-[520px] max-w-[92vw] overflow-visible"
            : "w-[360px] max-w-[40vw] min-h-[140px]"
        }
      >
        <OverlayFollowerGoal
          channel={channelFromQuery}
          coopstreamKey={coopstreamKeyFromQuery}
          preset={presetFromQuery}
          demo={demo}
        />
      </div>
    </div>
  )
}
