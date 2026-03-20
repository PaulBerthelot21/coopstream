import * as React from "react"
import { Camera } from "lucide-react"

export function OverlayCamera({
  title = "Caméra",
  subtitle = "Place ta source vidéo ici (webcam / capture) depuis OBS.",
  aspect = "4/3",
}: {
  title?: string
  subtitle?: string
  aspect?: "16/9" | "4/3" | "1/1" | "9/16"
}) {
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
      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-3xl bg-gradient-to-r from-sky-500/20 via-transparent to-violet-500/20 p-[10px] ring-1 ring-white/10">
        <div className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl bg-black/70 px-5 py-4 backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-10 rounded-t-2xl bg-gradient-to-r from-sky-500/20 via-transparent to-violet-500/20 blur-2xl" />

          {/* Coins décoratifs (habillage caméra) */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-4 top-4 h-16 w-16 border-l border-t border-white/20 rounded-tl-xl" />
            <div className="absolute right-4 top-4 h-16 w-16 border-r border-t border-white/20 rounded-tr-xl" />
            <div className="absolute left-4 bottom-4 h-16 w-16 border-l border-b border-white/20 rounded-bl-xl" />
            <div className="absolute right-4 bottom-4 h-16 w-16 border-r border-b border-white/20 rounded-br-xl" />
          </div>

          <div className="relative mb-3 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <Camera
                className="h-4 w-4 shrink-0 text-sky-400/90"
                aria-hidden
                strokeWidth={2.5}
              />
              <div className="min-w-0">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
                  {title}
                </div>
              </div>
            </div>
            <div className="shrink-0 text-[10px] font-mono text-white/40">OBS</div>
          </div>

          <div className="relative flex-1">
            <div className="absolute inset-x-0 inset-y-0 flex items-center justify-center px-1">
              <div className="w-full">
                <div
                  className={`${aspectClass} w-full overflow-hidden rounded-2xl border border-dashed border-white/25 bg-black/25 ring-1 ring-white/5`}
                >
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-6 text-center">
                    <div className="text-xs font-semibold text-white/65">Zone caméra</div>
                    <div className="text-[11px] text-white/45">{subtitle}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

