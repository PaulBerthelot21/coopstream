import type { Metadata } from "next"

import { OverlayBodyMode } from "@/components/overlay/overlay-body-mode"
import { OverlayIntro } from "@/components/overlay/overlay-intro"

export const metadata: Metadata = {
  title: "Overlay Intro",
}

export default async function OverlayIntroPage({
  searchParams,
}: {
  searchParams?: Promise<{ seconds?: string }>
}) {
  const sp = searchParams ? await searchParams : undefined
  const raw = sp?.seconds
  const parsed = typeof raw === "string" ? Number(raw) : NaN
  const startSeconds = Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 300

  return (
    <div className="h-dvh w-dvw bg-transparent pointer-events-none">
      <OverlayBodyMode />
      <OverlayIntro startSeconds={startSeconds} />
    </div>
  )
}

