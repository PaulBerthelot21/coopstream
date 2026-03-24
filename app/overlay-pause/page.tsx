import type { Metadata } from "next"

import { OverlayBodyMode } from "@/components/overlay/overlay-body-mode"
import { OverlayPause } from "@/components/overlay/overlay-pause"

export const metadata: Metadata = {
  title: "Overlay Pause",
}

export default async function OverlayPausePage({
  searchParams,
}: {
  searchParams?: Promise<{ title?: string; subtitle?: string; fx?: string }>
}) {
  const sp = searchParams ? await searchParams : undefined
  const title = typeof sp?.title === "string" ? sp.title.trim() : ""
  const subtitle = typeof sp?.subtitle === "string" ? sp.subtitle.trim() : ""
  const fx =
    sp?.fx === "off" || sp?.fx === "low" || sp?.fx === "high" || sp?.fx === "medium"
      ? sp.fx
      : "medium"

  return (
    <div className="h-dvh w-dvw bg-transparent pointer-events-none">
      <OverlayBodyMode />
      <OverlayPause title={title || "Pause"} subtitle={subtitle} fx={fx} />
    </div>
  )
}

