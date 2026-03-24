import * as React from "react"
import { Camera } from "lucide-react"
import { getOverlayPresetTheme, type OverlayPreset } from "@/lib/overlay/presets"

export function OverlayCamera({
  aspect = "4/3",
  preset = "default",
}: {
  aspect?: "16/9" | "4/3" | "1/1" | "9/16"
  preset?: OverlayPreset
}) {
  const visual = getOverlayPresetTheme(preset)
  const aspectClass =
    aspect === "16/9"
      ? "aspect-[16/9]"
      : aspect === "1/1"
        ? "aspect-[1/1]"
        : aspect === "9/16"
          ? "aspect-[9/16]"
          : "aspect-[4/3]"

  return (
    <div className="pointer-events-none select-none h-full w-full overflow-hidden">
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
              className={`${aspectClass} w-full overflow-hidden rounded-2xl border border-dashed border-white/25 bg-black/25 ring-1 ring-white/5`}
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

