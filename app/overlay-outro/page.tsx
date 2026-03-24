import type { Metadata } from "next"

import { OverlayBodyMode } from "@/components/overlay/overlay-body-mode"
import { OverlayOutro } from "@/components/overlay/overlay-outro"

export const metadata: Metadata = {
  title: "Overlay Outro",
}

export default async function OverlayOutroPage({
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
      <OverlayOutro title={title || "Merci d'avoir suivi"} subtitle={subtitle} fx={fx} />
    </div>
  )
}

