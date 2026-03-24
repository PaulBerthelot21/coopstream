import type { Metadata } from "next"

import { OverlayLastFollower } from "../../components/overlay/overlay-last-follower"
import { OverlayBodyMode } from "@/components/overlay/overlay-body-mode"
import { parseOverlayPreset } from "@/lib/overlay/presets"

export const metadata: Metadata = {
  title: "Overlay Dernier follower",
}

export default async function OverlayLastFollowerPage({
  searchParams,
}: {
  searchParams?: Promise<{ channel?: string; coopstreamKey?: string; preset?: string }>
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

  return (
    <div className="flex h-dvh w-dvw items-start justify-end bg-transparent pointer-events-none pr-6 pt-6">
      <OverlayBodyMode />
      <div className="w-[360px] max-w-[40vw] min-h-[140px]">
        <OverlayLastFollower
          channel={channelFromQuery}
          coopstreamKey={coopstreamKeyFromQuery}
          preset={presetFromQuery}
        />
      </div>
    </div>
  )
}
