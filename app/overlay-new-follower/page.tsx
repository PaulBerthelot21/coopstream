import type { Metadata } from "next"

import { OverlayNewFollowerToast } from "@/components/overlay/overlay-new-follower-toast"
import { OverlayBodyMode } from "@/components/overlay/overlay-body-mode"

export const metadata: Metadata = {
  title: "Overlay Nouveau follower",
}

export default async function OverlayNewFollowerPage({
  searchParams,
}: {
  searchParams?: Promise<{ channel?: string; coopstreamKey?: string }>
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

  return (
    <div className="flex h-dvh w-dvw items-start justify-end bg-transparent pointer-events-none pr-6 pt-6">
      <OverlayBodyMode />
      <div className="w-[420px] max-w-[45vw] h-[40vh] max-h-[380px]">
        <OverlayNewFollowerToast
          channel={channelFromQuery}
          coopstreamKey={coopstreamKeyFromQuery}
        />
      </div>
    </div>
  )
}

