"use client"

import * as React from "react"
import { Camera } from "lucide-react"
import { getOverlayPresetTheme, type OverlayPreset } from "@/lib/overlay/presets"

const FRAME_PX = 26

export function OverlayCamera({
  aspect = "4/3",
  preset = "default",
}: {
  aspect?: "16/9" | "4/3" | "1/1" | "9/16"
  preset?: OverlayPreset
}) {
  const visual = getOverlayPresetTheme(preset)
  const accent = visual.accentColor ?? "#ffc4a8"
  const marbleBg = visual.assets?.backgroundUrl
  const isRebrand = preset === "lecalme-rebrand"

  const aspectClass =
    aspect === "16/9"
      ? "aspect-[16/9]"
      : aspect === "1/1"
        ? "aspect-[1/1]"
        : aspect === "9/16"
          ? "aspect-[9/16]"
          : "aspect-[4/3]"

  if (isRebrand) {
    return (
      <div className="pointer-events-none relative flex h-full w-full select-none items-center justify-center">
        <div
          className={`relative w-full max-h-full ${aspectClass}`}
          style={{
            filter: "drop-shadow(0 18px 40px rgba(0,0,0,0.6))",
          }}
        >
          {/* Anneau marbre — trou central transparent (mask) */}
          <div
            className="absolute inset-0 rounded-[32px]"
            style={{
              padding: FRAME_PX,
              backgroundColor: "#1a1035",
              backgroundImage: marbleBg
                ? `linear-gradient(135deg, rgba(12,6,28,0.45), rgba(12,6,28,0.2) 40%, rgba(12,6,28,0.5)), url(${marbleBg})`
                : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
              WebkitMaskImage:
                "linear-gradient(#000 0 0), linear-gradient(#000 0 0)",
              WebkitMaskClip: "content-box, border-box",
              WebkitMaskComposite: "xor",
              maskImage: "linear-gradient(#000 0 0), linear-gradient(#000 0 0)",
              maskClip: "content-box, border-box",
              maskComposite: "exclude",
            }}
          />

          {/* Contour externe (même DA que chat / planning) */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[32px] border-[3px] border-[#2a1f5c]"
            style={{
              boxShadow:
                "0 0 0 1.5px rgba(236,240,255,0.95), inset 0 0 0 1px rgba(236,240,255,0.28)",
            }}
          />

          {/* Lèvre intérieure pêche, fine */}
          <div
            aria-hidden
            className="pointer-events-none absolute rounded-[18px]"
            style={{
              inset: FRAME_PX - 1,
              boxShadow: `inset 0 0 0 2px ${accent}aa, 0 0 18px ${accent}22`,
            }}
          />

          {/* Filet sombre entre marbre et webcam */}
          <div
            aria-hidden
            className="pointer-events-none absolute rounded-[17px]"
            style={{
              inset: FRAME_PX + 3,
              boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.55)",
            }}
          />

          {/* Trou webcam */}
          <div
            className="absolute rounded-[16px] bg-transparent"
            style={{ inset: FRAME_PX }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="pointer-events-none h-full w-full select-none overflow-hidden">
      <div
        className="relative flex h-full w-full flex-col overflow-hidden rounded-3xl p-[14px] ring-1 ring-white/10"
        style={{ backgroundImage: visual.topGlowGradient }}
      >
        <div className={visual.panelClassName}>
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-14 rounded-t-2xl blur-2xl"
            style={{ backgroundImage: visual.topGlowGradient }}
          />

          <div className="relative flex h-full w-full items-center justify-center px-2">
            <div
              className={`${aspectClass} relative w-full overflow-hidden rounded-2xl border border-dashed border-white/25 bg-black/25 ring-1 ring-white/5`}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(79,70,229,0.20)_0%,transparent_60%)]" />
              <div className="relative flex h-full w-full items-center justify-center">
                <Camera
                  className="h-10 w-10 text-sky-400/60"
                  aria-hidden
                  strokeWidth={2.5}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
