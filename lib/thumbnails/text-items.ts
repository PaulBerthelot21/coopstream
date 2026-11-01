import { getBadgePreset, type BadgeVariant } from "@/lib/thumbnails/badges"
import type { RelRect, TextItem, ThumbnailTemplate } from "@/lib/thumbnails/types"

let textSeq = 0

function nextId(prefix: string) {
  textSeq += 1
  return `${prefix}_${Date.now().toString(36)}_${textSeq}`
}

/** Titre marque style intro : outline blanc, italic, tracking serré. */
export function createOutlineTitle(
  text: string,
  rect: RelRect,
  sizeScale = 1,
): TextItem {
  return createTextItem({
    text,
    fontId: "lecalme",
    color: "transparent",
    stroke: "rgba(255,255,255,0.92)",
    strokeWidth: 2.5,
    sizeScale,
    align: "left",
    italic: true,
    uppercase: true,
    fillMode: "outline",
    tightTracking: true,
    rect,
  })
}

export function createTextItem(
  partial?: Partial<TextItem> & { rect?: RelRect },
): TextItem {
  return {
    id: partial?.id ?? nextId("txt"),
    kind: "text",
    text: partial?.text ?? "NOUVEAU TEXTE",
    fontId: partial?.fontId ?? "lecalme",
    color: partial?.color ?? "#ffffff",
    stroke: partial?.stroke ?? "rgba(255,255,255,0.92)",
    strokeWidth: partial?.strokeWidth ?? 2.5,
    sizeScale: partial?.sizeScale ?? 1,
    align: partial?.align ?? "left",
    italic: partial?.italic ?? true,
    uppercase: partial?.uppercase ?? true,
    fillMode: partial?.fillMode ?? "outline",
    tightTracking: partial?.tightTracking ?? true,
    rect: partial?.rect ?? { x: 0.06, y: 0.2, w: 0.45, h: 0.28 },
    visible: partial?.visible ?? true,
    locked: partial?.locked ?? false,
  }
}

export function createBadgeItem(
  variant: BadgeVariant,
  rect?: RelRect,
): TextItem {
  const preset = getBadgePreset(variant)
  return {
    id: nextId("badge"),
    kind: "badge",
    text: preset.label,
    fontId: "montserrat",
    color: "#FFFFFF",
    stroke: "transparent",
    strokeWidth: 0,
    sizeScale: 1,
    align: "left",
    italic: false,
    uppercase: true,
    fillMode: "solid",
    tightTracking: false,
    badgeVariant: variant,
    rect: rect ?? { x: 0.04, y: 0.06, w: 0.2, h: 0.06 },
    visible: true,
    locked: false,
  }
}

export function textFromTemplate(template: ThumbnailTemplate): TextItem {
  return createOutlineTitle("LE CALME", {
    x: template.title.x,
    y: template.title.y,
    w: template.title.w,
    h: template.title.h,
  })
}

export function isImageLayerId(
  id: string,
): id is "background" | "head" | "prop" {
  return id === "background" || id === "head" || id === "prop"
}
