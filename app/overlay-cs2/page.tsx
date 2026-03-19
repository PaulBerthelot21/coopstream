import type { Metadata } from "next"

import { OverlayCs2Gsi } from "@/components/overlay/overlay-cs2-gsi"

export const metadata: Metadata = {
  title: "Overlay CS2 GSI",
}

export default function OverlayCs2Page() {
  return <OverlayCs2Gsi />
}

