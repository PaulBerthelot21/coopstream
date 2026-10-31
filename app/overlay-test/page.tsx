import type { Metadata } from "next"

import { OverlayTestPanel } from "@/components/overlay/overlay-test-panel"

export const metadata: Metadata = {
  title: "Test overlays",
}

export default function OverlayTestPage() {
  return (
    <main className="min-h-dvh bg-background">
      <OverlayTestPanel />
    </main>
  )
}
