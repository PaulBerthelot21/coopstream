export const STINGER_VARIANTS = [
  {
    id: "diagonal",
    label: "Diagonale néon",
    description: "Bandeau violet / cyan en travers, classique stream.",
    durationMs: 1200,
    transitionMs: 600,
  },
  {
    id: "vertical",
    label: "Rideau vertical",
    description: "Vague horizontale qui traverse de haut en bas.",
    durationMs: 1200,
    transitionMs: 600,
  },
  {
    id: "iris",
    label: "Iris radial",
    description: "Anneau coloré qui s’ouvre depuis le centre.",
    durationMs: 1300,
    transitionMs: 650,
  },
  {
    id: "glitch",
    label: "Glitch bandes",
    description: "Bandes horizontales + léger décalage, style électro.",
    durationMs: 1000,
    transitionMs: 480,
  },
] as const

export type StingerVariantId = (typeof STINGER_VARIANTS)[number]["id"]

export function isStingerVariantId(v: string): v is StingerVariantId {
  return STINGER_VARIANTS.some((x) => x.id === v)
}

export function getStingerVariantMeta(id: StingerVariantId) {
  return STINGER_VARIANTS.find((v) => v.id === id) ?? STINGER_VARIANTS[0]
}
