import type { Metadata } from "next"

import { OverlayCamera } from "@/components/overlay/overlay-camera"

export const metadata: Metadata = {
  title: "Overlay Caméra",
}

export default function OverlayCameraPage() {
  return (
    <div className="flex h-dvh w-dvw items-start justify-end bg-transparent pointer-events-none pr-6 pt-6">
      <div className="w-[760px] max-w-[70vw] min-h-[520px]">
        <OverlayCamera />
      </div>
    </div>
  )
}

