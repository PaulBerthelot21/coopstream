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
  {
    id: "duclems-reset", studio: "duclems-reset", label: "Duclems - Reset",
    description: "Fond plein cadre, titre en haut à gauche et numéro sur une bande blanche inclinée.",
    background: { x: 0, y: 0, w: 1, h: 1 },
    title: { x: .06, y: .08, w: .57, h: .2, style: { ...baseTitleStyle, strokeWidth: 0 } },
    head: { x: 0, y: 0, w: 1, h: 1, fit: "contain" },
    prop: { x: 0, y: 0, w: .2, h: .2, fit: "contain" },
    episodePanel: true,
    effects: { purpleWash: 0, textVeil: 0, leftShade: 0, vignette: 0, headShadow: false },
  },
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
  ...([
    { id: "headline", label: "À la une", description: "Titre panoramique en haut, portrait en bas à droite.",
      title: { x: .045, y: .04, w: .91, h: .36 }, head: { x: .54, y: .35, w: .49, h: .7, fit: "contain" },
      studioText: { align: "left", solidKicker: true, accent: "#fde68a", italic: false }, effects: { textVeil: .2, leftShade: .25, purpleWash: .12 } },
    { id: "spotlight", label: "Spotlight", description: "Portrait au centre, deux titres de part et d’autre.",
      title: { x: .035, y: .26, w: .3, h: .55 }, head: { x: .3, y: .08, w: .4, h: .96, fit: "contain" },
      studioText: { align: "center", kicker: { x: .025, y: .3, w: .3, h: .26 }, main: { x: .69, y: .41, w: .285, h: .27 }, accent: "#ffc4a8", italic: false, mainScale: .78 }, effects: { purpleWash: .2, textVeil: .15, vignette: .65, leftShade: .15 } },
    { id: "duel", label: "Contrechamp", description: "Portrait à gauche et grand titre aligné à droite.",
      title: { x: .47, y: .18, w: .49, h: .54 }, head: { x: -.03, y: .05, w: .49, h: 1, fit: "contain" },
      studioText: { align: "right", solidKicker: true, accent: "#67e8f9" }, effects: { leftShade: .12, textVeil: .2, purpleWash: .25 } },
    { id: "editorial", label: "Édito", description: "Portrait à droite, titre blanc sur un bandeau sombre.",
      title: { x: .04, y: .62, w: .58, h: .32 }, head: { x: .58, y: .05, w: .44, h: .98, fit: "contain" },
      titleBand: { x: 0, y: .57, w: .66, h: .43, color: "rgba(9,14,25,.9)" },
      studioText: { solidKicker: true, italic: false }, effects: { textVeil: .1, leftShade: .2, purpleWash: .05 } },
    { id: "neon", label: "Néon", description: "Titres menthe à gauche, portrait rapproché à droite.",
      title: { x: .045, y: .26, w: .53, h: .56 }, head: { x: .52, y: .01, w: .54, h: 1.06, fit: "contain" },
      studioText: { accent: "#86efac" }, effects: { purpleWash: .6, textVeil: .8, leftShade: .65, vignette: .55 } },
    { id: "panorama", label: "Panorama", description: "Le décor au premier plan, une signature légère en haut.",
      title: { x: .04, y: .055, w: .47, h: .24 }, head: { x: .75, y: .55, w: .26, h: .48, fit: "contain" },
      studioText: { solidKicker: true, italic: false }, effects: { purpleWash: 0, textVeil: .1, leftShade: .15, vignette: .15 } },
    { id: "poster", label: "L’affiche", description: "Grand titre centré en haut et portrait central en bas.",
      title: { x: .06, y: .035, w: .88, h: .36 }, head: { x: .29, y: .4, w: .42, h: .64, fit: "contain" },
      studioText: { align: "center", solidKicker: true, accent: "#f9a8d4", italic: false }, effects: { purpleWash: .4, textVeil: .25, vignette: .6, leftShade: .2 } },
    { id: "reaction", label: "Réaction", description: "Portrait très présent à gauche et titre punchy à droite.",
      title: { x: .58, y: .34, w: .38, h: .5 }, head: { x: -.12, y: -.02, w: .72, h: 1.12, fit: "contain" },
      studioText: { solidKicker: true, accent: "#fcd34d", mainScale: .95 }, effects: { purpleWash: .15, textVeil: .2, leftShade: .1, vignette: .5 } },
  ] satisfies Array<{
    id: NonNullable<ThumbnailTemplate["studio"]>; label: string; description: string
    title: { x: number; y: number; w: number; h: number }; head: ThumbnailTemplate["head"]
    studioText: ThumbnailTemplate["studioText"]; effects: ThumbnailTemplate["effects"]; titleBand?: ThumbnailTemplate["titleBand"]
  }>).map((t): ThumbnailTemplate => ({
    id: t.id, studio: t.id, label: t.label, description: t.description,
    background: { x: 0, y: 0, w: 1, h: 1 },
    title: { ...t.title, style: { ...baseTitleStyle, fontSize: 88, maxWidth: 1 } },
    head: t.head, prop: { x: .8, y: .04, w: .16, h: .2, fit: "contain" },
    studioText: t.studioText, effects: t.effects, titleBand: t.titleBand,
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
