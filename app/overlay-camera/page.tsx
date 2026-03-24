import type { Metadata } from "next"

import { OverlayCamera } from "@/components/overlay/overlay-camera"
import { OverlayBodyMode } from "@/components/overlay/overlay-body-mode"
import { parseOverlayPreset } from "@/lib/overlay/presets"

export const metadata: Metadata = {
  title: "Overlay Caméra",
}

export default async function OverlayCameraPage({
  searchParams,
}: {
  searchParams?: Promise<{ preset?: string }>
}) {
  const sp = searchParams ? await searchParams : undefined
  const presetFromQuery = parseOverlayPreset(sp?.preset)

  return (
    <div className="flex h-dvh w-dvw items-start justify-end bg-transparent pointer-events-none pr-6 pt-6">
      <OverlayBodyMode />
      <div className="w-[820px] max-w-[70vw] min-h-[620px]">
        <OverlayCamera preset={presetFromQuery} />
      </div>
    </div>
  )
}

