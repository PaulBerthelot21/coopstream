export type BadgeVariant = "rediff" | "episode" | "resume" | "bestof"

export type BadgePreset = {
  id: BadgeVariant
  label: string
  /** Couleur du pilule */
  bg: string
  /** Couleur du texte */
  fg: string
}

export const BADGE_PRESETS: BadgePreset[] = [
  {
    id: "rediff",
    label: "REDIFF",
    bg: "#4C1D95",
    fg: "#FFFFFF",
  },
  {
    id: "episode",
    label: "ÉPISODE",
    bg: "#5B21B6",
    fg: "#FFFFFF",
  },
  {
    id: "resume",
    label: "RÉSUMÉ",
    bg: "#DDD6FE",
    fg: "#2E1065",
  },
  { id: "bestof", label: "BEST-OF", bg: "#7C3AED", fg: "#FFFFFF" },
]

export function getBadgePreset(id: BadgeVariant): BadgePreset {
  return BADGE_PRESETS.find((b) => b.id === id) ?? BADGE_PRESETS[0]!
}
