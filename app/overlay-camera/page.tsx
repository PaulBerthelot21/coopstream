import type { Metadata } from "next"

import { OverlayCamera } from "@/components/overlay/overlay-camera"

export const metadata: Metadata = {
  title: "Overlay Caméra",
}

export default function OverlayCameraPage() {
  return (
    <div className="flex h-dvh w-dvw items-start justify-end bg-transparent pointer-events-none pr-6 pt-6">
      <div className="w-[820px] max-w-[70vw] min-h-[620px]">
        <OverlayCamera />
      </div>
    </div>
  )
}

