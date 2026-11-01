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
  searchParams?: Promise<{ preset?: string; aspect?: string }>
}) {
  const sp = searchParams ? await searchParams : undefined
  const presetFromQuery = parseOverlayPreset(sp?.preset)
  const aspectRaw = typeof sp?.aspect === "string" ? sp.aspect.trim() : ""
  const aspect =
    aspectRaw === "16/9" ||
    aspectRaw === "4/3" ||
    aspectRaw === "1/1" ||
    aspectRaw === "9/16"
      ? aspectRaw
      : "4/3"

  return (
    <div className="flex h-dvh w-dvw items-center justify-center bg-transparent pointer-events-none p-10">
      <OverlayBodyMode />
      <div className="w-full max-w-[760px]">
        <OverlayCamera preset={presetFromQuery} aspect={aspect} />
      </div>
    </div>
  )
}
