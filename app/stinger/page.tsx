import type { Metadata } from "next"
import { Suspense } from "react"

import { StingerExportShell } from "@/components/stinger/stinger-export-shell"

export const metadata: Metadata = {
  title: "Stinger OBS",
  description:
    "Prévisualisation et capture de stingers 1920×1080 (fond vert chroma) pour OBS.",
}

export default function StingerPage() {
  return (
    <Suspense
      fallback={<div className="min-h-dvh animate-pulse bg-zinc-950" aria-label="Chargement" />}
    >
      <StingerExportShell />
    </Suspense>
  )
}
