import { createTextItem } from "./text-items"
import { defaultEditorState, layersFromTemplate } from "./compose-thumbnail"
import { getThumbnailTemplate } from "./templates"
import type { ThumbnailEditorState, ThumbnailTemplate } from "./types"

export function studioTexts(template: ThumbnailTemplate, previous: string[] = []) {
  const r = template.title
  const portrait = template.studio === "portrait"
  const minimal = template.studio === "minimal"
  const style = template.studioText
  const align = style?.align ?? "left"
  const italic = style?.italic ?? true
  return [
    createTextItem({ text: previous[0] ?? "UNE NOUVELLE", rect: style?.kicker ?? { x: r.x, y: r.y, w: r.w, h: r.h * .36 }, align, italic, sizeScale: .72, fillMode: style?.solidKicker ? "solid" : "outline", ...(style?.solidKicker ? { color: "#ffffff", stroke: "transparent", strokeWidth: 0 } : {}), shadow: .8 }),
    createTextItem({ text: previous[1] ?? "AVENTURE", rect: style?.main ?? { x: r.x + (portrait ? 0 : .015), y: r.y + r.h * .33, w: r.w, h: r.h * .67 }, align, italic, sizeScale: style?.mainScale ?? (minimal ? 1 : 1.28), fillMode: "solid", color: style?.accent ?? (template.studio === "impact" ? "#d8b4fe" : "#ffffff"), stroke: "transparent", strokeWidth: 0, shadow: .8 }),
  ]
}

export function createStudioState(id: string, previous?: ThumbnailEditorState): ThumbnailEditorState {
  const template = getThumbnailTemplate(id)
  const base = previous ?? defaultEditorState()
  return { ...base, templateId: template.id, layers: layersFromTemplate(template), headFit: template.head.fit, propFit: template.prop.fit,
    texts: studioTexts(template, previous?.texts.filter(t => t.kind === "text").map(t => t.text)), titleBand: template.titleBand ? { ...template.titleBand, visible: true } : null,
    effects: { ...base.effects, leftShade: .55, textVeil: .65, vignette: .4, headShadow: true, headShadowBlur: 40, headShadowOpacity: .7, purpleWash: .3, ...template.effects },
  }
}

export function createBlankState(): ThumbnailEditorState {
  const base = defaultEditorState()
  return { ...base, templateId: "blank", backgroundUrl: null, headUrl: null, propUrl: null, texts: [], titleBand: null,
    layers: { ...base.layers, head: { ...base.layers.head, visible: false }, prop: { ...base.layers.prop, visible: false } },
    effects: { ...base.effects, leftShade: 0, textVeil: 0, vignette: 0, purpleWash: 0 },
  }
}
