import type { ThumbnailTemplate } from "@/lib/thumbnails/types"

/** Style titre = Geist Black italic (fill solide, contour optionnel) */
const baseTitleStyle = {
  fontSize: 72,
  align: "left" as const,
  color: "#ffffff",
  strokeColor: "rgba(0,0,0,0.55)",
  strokeWidth: 6,
  maxWidth: 0.9,
  lineHeight: 0.92,
}

export const THUMBNAIL_TEMPLATES: ThumbnailTemplate[] = [
  ...([
    { id: "signature", label: "Signature", description: "L’esprit de l’intro : contour blanc, titre massif et Bryan à droite.", x: .045, y: .48, w: .55, h: .42, hx: .5, hy: .08, hw: .53, hh: .95 },
    { id: "impact", label: "Impact violet", description: "Un titre lavande et un portrait rapproché pour les moments forts.", x: .045, y: .13, w: .59, h: .5, hx: .48, hy: .2, hw: .58, hh: .9 },
    { id: "portrait", label: "Face à face", description: "Bryan à gauche, titre à droite : une autre façon de raconter.", x: .49, y: .4, w: .47, h: .46, hx: -.03, hy: .06, hw: .53, hh: .98 },
    { id: "minimal", label: "Cinéma", description: "Le jeu respire, la signature reste discrète en bas de l’image.", x: .045, y: .62, w: .6, h: .3, hx: .66, hy: .34, hw: .35, hh: .67 },
  ] as const).map((t): ThumbnailTemplate => ({
    id: t.id, studio: t.id, label: t.label, description: t.description,
    background: { x: 0, y: 0, w: 1, h: 1 },
    title: { x: t.x, y: t.y, w: t.w, h: t.h, style: { ...baseTitleStyle, fontSize: 88, maxWidth: 1 } },
    head: { x: t.hx, y: t.hy, w: t.hw, h: t.hh, fit: "contain" },
    prop: { x: .8, y: .04, w: .16, h: .2, fit: "contain" },
    effects: { purpleWash: t.id === "impact" ? .55 : .24, textVeil: t.id === "minimal" ? .45 : .7 },
  })),
  {
    id: "bryan-cine",
    label: "Bryan ciné",
    description:
      "Fond gameplay / ciné, Bryan à droite, titre punch à gauche + badge.",
    background: { x: 0, y: 0, w: 1, h: 1 },
    title: {
      x: 0.04,
      y: 0.28,
      w: 0.46,
      h: 0.42,
      style: {
        ...baseTitleStyle,
        fontSize: 88,
        align: "left",
      },
    },
    head: { x: 0.42, y: 0.08, w: 0.62, h: 0.98, fit: "contain" },
    prop: { x: 0.04, y: 0.72, w: 0.16, h: 0.2, fit: "contain" },
    effects: {
      leftShade: 0.35,
      textVeil: 0.78,
      vignette: 0.18,
      headShadow: true,
      headShadowBlur: 26,
      headShadowOpacity: 0.45,
    },
  },
  {
    id: "cine-title-left",
    label: "Ciné titre gauche",
    description:
      "Gameplay / cinématique full, titre à gauche, tête détourée à droite + ombre.",
    background: { x: 0, y: 0, w: 1, h: 1 },
    title: {
      x: 0.04,
      y: 0.22,
      w: 0.48,
      h: 0.5,
      style: {
        ...baseTitleStyle,
        fontSize: 82,
        align: "left",
      },
    },
    head: { x: 0.48, y: 0.02, w: 0.56, h: 1.05, fit: "contain" },
    prop: { x: 0.04, y: 0.72, w: 0.18, h: 0.22, fit: "contain" },
    effects: {
      leftShade: 0.62,
      vignette: 0.4,
      headShadow: true,
      headShadowBlur: 32,
      headShadowOpacity: 0.6,
    },
  },
  {
    id: "gameplay-punch",
    label: "Gameplay punch",
    description: "Titre gros haut-gauche, tête close-up bas-droite, ombre forte.",
    background: { x: 0, y: 0, w: 1, h: 1 },
    title: {
      x: 0.04,
      y: 0.1,
      w: 0.55,
      h: 0.42,
      style: {
        ...baseTitleStyle,
        fontSize: 96,
        align: "left",
      },
    },
    head: { x: 0.42, y: 0.18, w: 0.62, h: 0.92, fit: "contain" },
    prop: { x: 0.78, y: 0.04, w: 0.2, h: 0.22, fit: "contain" },
    effects: {
      leftShade: 0.7,
      vignette: 0.45,
      headShadow: true,
      headShadowBlur: 40,
      headShadowOpacity: 0.65,
    },
  },
  {
    id: "hero-left",
    label: "Hero gauche",
    description: "Tête grande à gauche, titre à droite (style classique).",
    background: { x: 0, y: 0, w: 1, h: 1 },
    head: { x: -0.02, y: 0.08, w: 0.52, h: 0.92, fit: "contain" },
    title: {
      x: 0.48,
      y: 0.28,
      w: 0.48,
      h: 0.45,
      style: {
        ...baseTitleStyle,
        fontSize: 78,
        align: "left",
      },
    },
    prop: { x: 0.72, y: 0.68, w: 0.26, h: 0.28, fit: "contain" },
    effects: {
      leftShade: 0.15,
      vignette: 0.3,
      headShadow: true,
    },
  },
  {
    id: "bottom-banner",
    label: "Bandeau bas",
    description: "Fond full, bandeau titre, tête découpée à droite.",
    background: { x: 0, y: 0, w: 1, h: 1 },
    titleBand: {
      x: 0,
      y: 0.68,
      w: 1,
      h: 0.32,
      color: "rgba(8,4,18,0.78)",
    },
    title: {
      x: 0.04,
      y: 0.72,
      w: 0.58,
      h: 0.24,
      style: {
        ...baseTitleStyle,
        fontSize: 64,
        align: "left",
        strokeWidth: 6,
      },
    },
    head: { x: 0.55, y: 0.12, w: 0.48, h: 0.88, fit: "contain" },
    prop: { x: 0.04, y: 0.08, w: 0.2, h: 0.22, fit: "contain" },
    effects: {
      leftShade: 0.25,
      vignette: 0.25,
      headShadow: true,
    },
  },
]

export function getThumbnailTemplate(id: string): ThumbnailTemplate {
  return (
    THUMBNAIL_TEMPLATES.find((t) => t.id === id) ?? THUMBNAIL_TEMPLATES[0]!
  )
}
