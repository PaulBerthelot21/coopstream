export type OverlayPreset = "default" | "lecalme" | "lecalme-rebrand"

export type OverlayPresetTheme = {
  panelClassName: string
  topGlowGradient: string
  progressGradient: string
  wheelGradient: string
  targetIconClassName: string
  heartIconClassName: string
  sparkleIconClassName: string
  /** Assets optionnels pour le rebrand (fond marbre + chibis). */
  assets?: {
    backgroundUrl: string
    chibiUrl: string
    chibiFollowUrl?: string
    chibiSubUrl?: string
  }
  accentColor?: string
}

const PRESET_THEMES: Record<OverlayPreset, OverlayPresetTheme> = {
  default: {
    panelClassName:
      "relative flex h-full w-full flex-col overflow-hidden rounded-2xl bg-black/70 px-4 py-3 ring-1 ring-white/10 backdrop-blur-xl",
    topGlowGradient:
      "linear-gradient(to right, rgba(14,165,233,0.2), rgba(255,255,255,0), rgba(139,92,246,0.2))",
    progressGradient: "linear-gradient(to right, rgb(52 211 153), rgb(190 242 100))",
    wheelGradient:
      "conic-gradient(from 90deg, rgba(79,70,229,0.95) 0deg, rgba(236,72,153,0.9) 60deg, rgba(34,197,94,0.85) 120deg, rgba(59,130,246,0.9) 180deg, rgba(236,72,153,0.9) 240deg, rgba(79,70,229,0.95) 300deg, rgba(79,70,229,0.95) 360deg)",
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
      "conic-gradient(from 90deg, rgba(76,29,149,0.96) 0deg, rgba(88,28,135,0.93) 72deg, rgba(67,56,202,0.9) 144deg, rgba(91,33,182,0.93) 216deg, rgba(49,46,129,0.92) 288deg, rgba(76,29,149,0.96) 360deg)",
    targetIconClassName: "h-3.5 w-3.5 shrink-0 text-violet-200",
    heartIconClassName: "h-3.5 w-3.5 shrink-0 text-violet-200",
    sparkleIconClassName: "h-4 w-4 text-violet-200",
  },
  "lecalme-rebrand": {
    panelClassName:
      "relative flex h-full w-full flex-col overflow-hidden rounded-[28px] border-[3px] border-[#2a1f5c] bg-[#1a1035]",
    topGlowGradient: "linear-gradient(to right, transparent, rgba(255,196,168,0.95), transparent)",
    progressGradient: "linear-gradient(to right, #ffc4a8, #f5a888)",
    wheelGradient:
      "conic-gradient(from 90deg, rgba(42,31,92,0.96) 0deg, rgba(88,28,135,0.93) 72deg, rgba(67,56,202,0.9) 144deg, rgba(245,168,136,0.85) 216deg, rgba(42,31,92,0.96) 360deg)",
    targetIconClassName: "h-3.5 w-3.5 shrink-0 text-[#ffc4a8]",
    heartIconClassName: "h-3.5 w-3.5 shrink-0 text-[#ffc4a8]",
    sparkleIconClassName: "h-4 w-4 text-[#ffc4a8]",
    accentColor: "#ffc4a8",
    assets: {
      backgroundUrl: "/overlays/lecalme-rebrand/background.jpg",
      chibiUrl: "/overlays/lecalme-rebrand/chibi.png",
      chibiFollowUrl: "/overlays/lecalme-rebrand/chibi-follow.png",
      chibiSubUrl: "/overlays/lecalme-rebrand/chibi-sub.png",
    },
  },
}

export function parseOverlayPreset(raw?: string): OverlayPreset {
  if (raw === "lecalme-rebrand") return "lecalme-rebrand"
  if (raw === "lecalme") return "lecalme"
  return "default"
}

export function getOverlayPresetTheme(preset: OverlayPreset): OverlayPresetTheme {
  return PRESET_THEMES[preset]
}

export type OverlayPresetOption = {
  id: OverlayPreset
  label: string
  description: string
  swatch: string
}

export const OVERLAY_PRESET_OPTIONS: OverlayPresetOption[] = [
  {
    id: "default",
    label: "Default",
    description: "Glass sombre, accents cyan / violet",
    swatch: "linear-gradient(135deg, #0ea5e9 0%, #111827 45%, #8b5cf6 100%)",
  },
  {
    id: "lecalme",
    label: "Le Calme",
    description: "Violet profond, bordure néon",
    swatch: "linear-gradient(135deg, #4c1d95 0%, #1e1035 50%, #a855f7 100%)",
  },
  {
    id: "lecalme-rebrand",
    label: "Rebrand",
    description: "Marbre + chibi, accent pêche",
    swatch: "linear-gradient(135deg, #2a1f5c 0%, #ffc4a8 55%, #1a1035 100%)",
  },
]

export const OVERLAY_PRESET_STORAGE_KEY = "coopstream-overlay-preset"
