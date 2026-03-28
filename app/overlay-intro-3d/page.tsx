import type { Metadata } from "next"

import { OverlayBodyMode } from "@/components/overlay/overlay-body-mode"
import { OverlayIntro3D } from "@/components/overlay/overlay-intro-3d"
import { isIntro3dSceneId } from "@/lib/intro-3d-scenes"

export const metadata: Metadata = {
  title: "Overlay Intro 3D",
  description:
    "Intro stream WebGL (Three.js) : portail néon, élégance, nébuleuse ou vitesse — `?scene=…`.",
}

export default async function OverlayIntro3DPage({
  searchParams,
}: {
  searchParams?: Promise<{ seconds?: string; subtitle?: string; fx?: string; scene?: string }>
}) {
  const sp = searchParams ? await searchParams : undefined
  const raw = sp?.seconds
  const parsed = typeof raw === "string" ? Number(raw) : NaN
  const startSeconds = Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 300
  const subtitle = typeof sp?.subtitle === "string" ? sp.subtitle.trim() : ""
  const fx =
    sp?.fx === "off" || sp?.fx === "low" || sp?.fx === "high" || sp?.fx === "medium"
      ? sp.fx
      : "medium"
  const rawScene = typeof sp?.scene === "string" ? sp.scene.trim() : ""
  const scene = isIntro3dSceneId(rawScene) ? rawScene : "portal"

  return (
    <div className="h-dvh w-dvw bg-transparent pointer-events-none">
      <OverlayBodyMode />
      <OverlayIntro3D startSeconds={startSeconds} subtitle={subtitle} fx={fx} scene={scene} />
    </div>
  )
}
