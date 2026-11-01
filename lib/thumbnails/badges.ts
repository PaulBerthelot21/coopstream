export type BadgeVariant = "rediff" | "episode" | "resume"

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
    bg: "#C41E3A",
    fg: "#FFFFFF",
  },
  {
    id: "episode",
    label: "EPISODE",
    bg: "#1E3A8A",
    fg: "#FFFFFF",
  },
  {
    id: "resume",
    label: "RESUME",
    bg: "#E8B923",
    fg: "#111111",
  },
]

export function getBadgePreset(id: BadgeVariant): BadgePreset {
  return BADGE_PRESETS.find((b) => b.id === id) ?? BADGE_PRESETS[0]!
}
