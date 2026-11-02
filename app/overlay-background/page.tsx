import type { Metadata } from "next"
import Image from "next/image"
import { OverlayBodyMode } from "@/components/overlay/overlay-body-mode"
import { parseOverlayPreset } from "@/lib/overlay/presets"

export const metadata: Metadata = { title: "Fond de scène · Overlay" }

export default async function OverlayBackgroundPage({ searchParams }: { searchParams: Promise<{ preset?: string }> }) {
  const sp = await searchParams
  const preset = parseOverlayPreset(sp.preset)
  return <div className="pointer-events-none relative h-dvh w-dvw"><OverlayBodyMode />{preset === "lecalme-rebrand" ? <Image src="/overlays/lecalme-rebrand/scene-chat-bg.png" alt="Fond de scène Chat" fill priority unoptimized sizes="100vw" className="object-cover" /> : <div className="absolute inset-0 bg-[#020617]" />}</div>
}
