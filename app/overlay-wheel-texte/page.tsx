import type { Metadata } from "next"

import { OverlayWheelText } from "@/components/overlay/overlay-wheel-text"
import { OverlayBodyMode } from "@/components/overlay/overlay-body-mode"

export const metadata: Metadata = {
  title: "Overlay Roulette",
}

export default async function OverlayWheelTextPage({
  searchParams,
}: {
  searchParams?: Promise<{ coopstreamKey?: string }>
}) {
  const sp = searchParams ? await searchParams : undefined
  const coopstreamKey =
    typeof sp?.coopstreamKey === "string" && sp.coopstreamKey.trim()
      ? sp.coopstreamKey.trim()
      : undefined

  return (
    <div className="flex h-dvh w-dvw items-start justify-end bg-transparent pointer-events-none pr-6 pt-6">
      <OverlayBodyMode />
      <div className="w-[520px] max-w-[55vw] h-[52vh] max-h-[520px]">
        <OverlayWheelText coopstreamKey={coopstreamKey} />
      </div>
    </div>
  )
}

