import type { BadgeVariant } from "@/lib/thumbnails/badges"

export const THUMB_W = 1280
export const THUMB_H = 720

/** Rectangle relatif (0–1) dans le canvas 1280×720 — peut dépasser pour crop/overflow */
export type RelRect = {
  x: number
  y: number
  w: number
  h: number
}

export type TitleStyle = {
  fontSize: number
  align: "left" | "center" | "right"
  color: string
  strokeColor: string
  strokeWidth: number
  maxWidth: number
  lineHeight: number
}

export type ImageFit = "cover" | "contain"

/** Calques image fixes */
export type ImageLayerId = "background" | "head" | "prop"

export type LayerState = {
  rect: RelRect
  visible: boolean
  locked: boolean
}

export type TextItemKind = "text" | "badge"

/** solid = fill plein · outline = contour blanc style intro (fill transparent) */
export type TextFillMode = "solid" | "outline"

/** Bloc texte libre ou badge (REDIFF / EPISODE / RESUME) */
export type TextItem = {
  id: string
  kind: TextItemKind
  text: string
  fontId: string
  color: string
  stroke: string
  strokeWidth: number
  sizeScale: number
  align: "left" | "center" | "right"
  italic: boolean
  uppercase: boolean
  /** Style intro Le Calme = outline */
  fillMode: TextFillMode
  /** Tracking négatif type intro (~ -0.04em) */
  tightTracking: boolean
  badgeVariant?: BadgeVariant
  shadow?: number
  rect: RelRect
  visible: boolean
  locked: boolean
}

/** Effets fond / sujet (lisibilité sur ciné & gameplay) */
export type ThumbnailEffects = {
  leftShade: number
  /** Voile ombré bas-gauche (zone titres) 0–1 */
  textVeil: number
  vignette: number
  headShadow: boolean
  headShadowBlur: number
  headShadowOpacity: number
  purpleWash?: number
}

export type ThumbnailTemplate = {
  id: string
  label: string
  description: string
  background: RelRect
  title: RelRect & { style: TitleStyle }
  head: RelRect & { fit: ImageFit }
  prop: RelRect & { fit: ImageFit }
  titleBand?: RelRect & { color: string }
  episodePanel?: boolean
  effects?: Partial<ThumbnailEffects>
  studio?: "signature" | "impact" | "portrait" | "minimal" | "headline" | "spotlight" | "duel" | "editorial" | "neon" | "panorama" | "poster" | "reaction" | "duclems-reset"
  studioText?: {
    align?: TextItem["align"]; accent?: string; italic?: boolean; solidKicker?: boolean; mainScale?: number
    kicker?: RelRect; main?: RelRect
  }
}

export type ThumbnailEditorState = {
  templateId: string
  backgroundUrl: string | null
  headUrl: string | null
  propUrl: string | null
  headFit: ImageFit
  propFit: ImageFit
  layers: Record<ImageLayerId, LayerState>
  /** Plusieurs textes + badges */
  texts: TextItem[]
  titleBand: (RelRect & { color: string; visible: boolean }) | null
  effects: ThumbnailEffects
}

/** Sélection : calque image ou id d’un TextItem */
export type SelectedId = ImageLayerId | string

export const DEFAULT_EFFECTS: ThumbnailEffects = {
  leftShade: 0.4,
  textVeil: 0.65,
  vignette: 0.25,
  headShadow: true,
  headShadowBlur: 28,
  headShadowOpacity: 0.55,
}

export const IMAGE_LAYER_LABELS: Record<ImageLayerId, string> = {
  background: "Fond",
  head: "Tête",
  prop: "Élément",
}

export const IMAGE_LAYER_STACK: ImageLayerId[] = [
  "background",
  "head",
  "prop",
]

/** @deprecated alias compat */
export type LayerId = ImageLayerId | "title"
export const LAYER_LABELS = IMAGE_LAYER_LABELS as Record<string, string>
export const LAYER_STACK = IMAGE_LAYER_STACK
