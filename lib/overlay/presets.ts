export type OverlayPreset = "default" | "lecalme"

export type OverlayPresetTheme = {
  panelClassName: string
  topGlowGradient: string
  progressGradient: string
  wheelGradient: string
  targetIconClassName: string
  heartIconClassName: string
  sparkleIconClassName: string
}

const PRESET_THEMES: Record<OverlayPreset, OverlayPresetTheme> = {
  default: {
    panelClassName:
      "relative flex h-full w-full flex-col overflow-hidden rounded-2xl bg-black/70 px-4 py-3 ring-1 ring-white/10 backdrop-blur-xl",
    topGlowGradient:
      "linear-gradient(to right, rgba(14,165,233,0.2), rgba(255,255,255,0), rgba(139,92,246,0.2))",
    progressGradient: "linear-gradient(to right, rgb(52 211 153), rgb(190 242 100))",
    wheelGradient:
      "conic-gradient(from 90deg,rgba(79,70,229,0.95) 0deg,rgba(236,72,153,0.9) 60deg,rgba(34,197,94,0.85) 120deg,rgba(59,130,246,0.9) 180deg,rgba(236,72,153,0.9) 240deg,rgba(79,70,229,0.95) 300deg,rgba(79,70,229,0.95) 360deg)",
    targetIconClassName: "h-3.5 w-3.5 shrink-0 text-violet-300/90",
    heartIconClassName: "h-3.5 w-3.5 shrink-0 text-rose-400/90",
    sparkleIconClassName: "h-4 w-4 text-emerald-300/90",
  },
  lecalme: {
    panelClassName:
      "relative flex h-full w-full flex-col overflow-hidden rounded-2xl border-2 border-violet-400/70 bg-black/90 px-4 py-3 ring-1 ring-violet-300/35 backdrop-blur-md",
    topGlowGradient:
      "linear-gradient(to right, rgba(76,29,149,0.55), rgba(17,24,39,0.22), rgba(139,92,246,0.6))",
    progressGradient: "linear-gradient(to right, rgb(99 102 241), rgb(168 85 247))",
    wheelGradient:
      "conic-gradient(from 90deg,rgba(76,29,149,0.96) 0deg,rgba(88,28,135,0.93) 72deg,rgba(67,56,202,0.9) 144deg,rgba(91,33,182,0.93) 216deg,rgba(49,46,129,0.92) 288deg,rgba(76,29,149,0.96) 360deg)",
    targetIconClassName: "h-3.5 w-3.5 shrink-0 text-violet-200",
    heartIconClassName: "h-3.5 w-3.5 shrink-0 text-violet-200",
    sparkleIconClassName: "h-4 w-4 text-violet-200",
  },
}

export function parseOverlayPreset(raw?: string): OverlayPreset {
  if (raw === "lecalme") return "lecalme"
  return "default"
}

export function getOverlayPresetTheme(preset: OverlayPreset): OverlayPresetTheme {
  return PRESET_THEMES[preset]
}

