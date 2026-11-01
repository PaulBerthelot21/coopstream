import { getBadgePreset } from "@/lib/thumbnails/badges"
import {
  ensureThumbnailFont,
  getThumbnailFont,
} from "@/lib/thumbnails/fonts"
import {
  createBadgeItem,
  createTextItem,
  textFromTemplate,
} from "@/lib/thumbnails/text-items"
import {
  DEFAULT_EFFECTS,
  THUMB_H,
  THUMB_W,
  type ImageFit,
  type LayerState,
  type RelRect,
  type TextItem,
  type ThumbnailEditorState,
  type ThumbnailEffects,
  type ThumbnailTemplate,
  type TitleStyle,
} from "@/lib/thumbnails/types"
import { getThumbnailTemplate } from "@/lib/thumbnails/templates"

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n))
}

function toPx(r: RelRect) {
  return {
    x: r.x * THUMB_W,
    y: r.y * THUMB_H,
    w: r.w * THUMB_W,
    h: r.h * THUMB_H,
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Impossible de charger ${url}`))
    img.src = url
  })
}

function fittedDrawBox(
  img: HTMLImageElement,
  rect: RelRect,
  fit: ImageFit,
) {
  const box = toPx(rect)
  const iw = img.naturalWidth || img.width
  const ih = img.naturalHeight || img.height
  if (!iw || !ih || box.w <= 0 || box.h <= 0) return null

  const scale =
    fit === "cover"
      ? Math.max(box.w / iw, box.h / ih)
      : Math.min(box.w / iw, box.h / ih)

  const dw = iw * scale
  const dh = ih * scale
  const dx = box.x + (box.w - dw) / 2
  const dy = box.y + (box.h - dh) / 2
  return { box, dx, dy, dw, dh }
}

function drawFitted(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  rect: RelRect,
  fit: ImageFit,
  shadow?: { blur: number; opacity: number } | null,
) {
  const fitted = fittedDrawBox(img, rect, fit)
  if (!fitted) return
  const { box, dx, dy, dw, dh } = fitted

  ctx.save()
  if (fit === "cover") {
    ctx.beginPath()
    ctx.rect(box.x, box.y, box.w, box.h)
    ctx.clip()
  }
  if (shadow && shadow.opacity > 0) {
    ctx.shadowColor = `rgba(0,0,0,${clamp01(shadow.opacity)})`
    ctx.shadowBlur = shadow.blur
    ctx.shadowOffsetX = Math.round(shadow.blur * 0.15)
    ctx.shadowOffsetY = Math.round(shadow.blur * 0.35)
  }
  ctx.drawImage(img, dx, dy, dw, dh)
  ctx.restore()
}

function drawBgEffects(
  ctx: CanvasRenderingContext2D,
  effects: ThumbnailEffects,
) {
  // Grade gauche neutre
  const left = clamp01(effects.leftShade)
  if (left > 0.01) {
    const g = ctx.createLinearGradient(0, 0, THUMB_W * 0.58, 0)
    g.addColorStop(0, `rgba(0,0,0,${0.55 * left})`)
    g.addColorStop(0.5, `rgba(0,0,0,${0.2 * left})`)
    g.addColorStop(1, "rgba(0,0,0,0)")
    ctx.fillStyle = g
    ctx.fillRect(0, 0, THUMB_W, THUMB_H)
  }

  // Voile ombré zone titres (bas-gauche) — fait ressortir le texte sur ciné clair
  const veil = clamp01(effects.textVeil ?? 0)
  if (veil > 0.01) {
    // Dégradé depuis le coin bas-gauche
    const corner = ctx.createRadialGradient(
      0,
      THUMB_H,
      THUMB_H * 0.05,
      THUMB_W * 0.08,
      THUMB_H * 0.92,
      THUMB_W * 0.72,
    )
    corner.addColorStop(0, `rgba(0,0,0,${0.78 * veil})`)
    corner.addColorStop(0.45, `rgba(0,0,0,${0.42 * veil})`)
    corner.addColorStop(1, "rgba(0,0,0,0)")
    ctx.fillStyle = corner
    ctx.fillRect(0, 0, THUMB_W, THUMB_H)

    // Renfort horizontal bas (sol clair du gameplay)
    const bottom = ctx.createLinearGradient(0, THUMB_H * 0.35, 0, THUMB_H)
    bottom.addColorStop(0, "rgba(0,0,0,0)")
    bottom.addColorStop(0.45, `rgba(0,0,0,${0.22 * veil})`)
    bottom.addColorStop(1, `rgba(0,0,0,${0.55 * veil})`)
    ctx.fillStyle = bottom
    // Clip approximatif côté texte (gauche ~55%)
    ctx.save()
    ctx.beginPath()
    ctx.rect(0, 0, THUMB_W * 0.58, THUMB_H)
    ctx.clip()
    ctx.fillRect(0, 0, THUMB_W, THUMB_H)
    ctx.restore()
  }

  const vig = clamp01(effects.vignette)
  if (vig > 0.01) {
    const rad = ctx.createRadialGradient(
      THUMB_W * 0.55,
      THUMB_H * 0.4,
      THUMB_H * 0.15,
      THUMB_W * 0.5,
      THUMB_H * 0.5,
      THUMB_W * 0.78,
    )
    rad.addColorStop(0, "rgba(0,0,0,0)")
    rad.addColorStop(1, `rgba(0,0,0,${0.42 * vig})`)
    ctx.fillStyle = rad
    ctx.fillRect(0, 0, THUMB_W, THUMB_H)
  }
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return []
  const lines: string[] = []
  let current = words[0]!
  for (let i = 1; i < words.length; i++) {
    const next = `${current} ${words[i]}`
    if (ctx.measureText(next).width <= maxWidth) {
      current = next
    } else {
      lines.push(current)
      current = words[i]!
    }
  }
  lines.push(current)
  return lines
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

type DrawTextOpts = {
  fontId: string
  italic: boolean
  uppercase: boolean
  strokeWidth: number
  fillMode: "solid" | "outline"
  tightTracking: boolean
}

function measureTrackedWidth(
  ctx: CanvasRenderingContext2D,
  line: string,
  trackingPx: number,
) {
  if (Math.abs(trackingPx) < 0.1) return ctx.measureText(line).width
  let w = 0
  for (let i = 0; i < line.length; i++) {
    w += ctx.measureText(line[i]!).width
    if (i < line.length - 1) w += trackingPx
  }
  return w
}

function strokeTracked(
  ctx: CanvasRenderingContext2D,
  line: string,
  x: number,
  y: number,
  trackingPx: number,
) {
  if (Math.abs(trackingPx) < 0.1) {
    ctx.strokeText(line, x, y)
    return
  }
  let cursor = x
  for (const ch of line) {
    ctx.strokeText(ch, cursor, y)
    cursor += ctx.measureText(ch).width + trackingPx
  }
}

function fillTracked(
  ctx: CanvasRenderingContext2D,
  line: string,
  x: number,
  y: number,
  trackingPx: number,
) {
  if (Math.abs(trackingPx) < 0.1) {
    ctx.fillText(line, x, y)
    return
  }
  let cursor = x
  for (const ch of line) {
    ctx.fillText(ch, cursor, y)
    cursor += ctx.measureText(ch).width + trackingPx
  }
}

function drawPlainText(
  ctx: CanvasRenderingContext2D,
  text: string,
  rect: RelRect,
  style: TitleStyle,
  sizeScale: number,
  opts: DrawTextOpts,
) {
  const font = getThumbnailFont(opts.fontId)
  const box = toPx(rect)
  const fontSize = Math.max(18, style.fontSize * sizeScale)
  const italic = opts.italic ? "italic " : ""
  ctx.font = `${italic}${font.weight} ${fontSize}px ${font.stack}`
  ctx.textBaseline = "top"
  ctx.lineJoin = "round"
  ctx.miterLimit = 2

  const raw = opts.uppercase ? text.toUpperCase() : text
  const trackingPx = opts.tightTracking ? fontSize * -0.04 : 0
  const maxW = box.w * clamp01(style.maxWidth)
  const lineH =
    fontSize * (opts.fillMode === "outline" ? 0.82 : style.lineHeight)
  const lines = wrapLines(ctx, raw, maxW)
  const blockH = lines.length * lineH
  let y = box.y + Math.max(0, (box.h - blockH) / 2)

  const outline = opts.fillMode === "outline"
  const fillColor = outline
    ? null
    : !style.color || style.color === "transparent"
      ? "#ffffff"
      : style.color

  const strokeColor = outline
    ? style.strokeColor && style.strokeColor !== "transparent"
      ? style.strokeColor
      : "rgba(255,255,255,0.92)"
    : style.strokeColor
  const hasStroke =
    Boolean(strokeColor) &&
    strokeColor !== "transparent" &&
    (outline || opts.strokeWidth > 0)
  const strokeW = outline
    ? Math.max(2.2, Math.min(4.2, fontSize * 0.036))
    : Math.max(1, opts.strokeWidth * sizeScale)

  for (const line of lines) {
    const tw = measureTrackedWidth(ctx, line, trackingPx)
    let x = box.x
    if (style.align === "center") x = box.x + (box.w - tw) / 2
    if (style.align === "right") x = box.x + box.w - tw

    // Même esprit que l’intro : ombre douce, pas de « punch stroke » YouTube
    ctx.save()
    ctx.shadowColor = "rgba(0,0,0,0.85)"
    ctx.shadowBlur = outline ? 26 : 18
    ctx.shadowOffsetY = outline ? 7 : 4

    if (hasStroke) {
      ctx.strokeStyle = strokeColor!
      ctx.lineWidth = strokeW
      strokeTracked(ctx, line, x, y, trackingPx)
    }
    if (fillColor) {
      ctx.fillStyle = fillColor
      fillTracked(ctx, line, x, y, trackingPx)
    }
    ctx.restore()

    if (hasStroke) {
      ctx.strokeStyle = strokeColor!
      ctx.lineWidth = strokeW
      strokeTracked(ctx, line, x, y, trackingPx)
    }
    if (fillColor) {
      ctx.fillStyle = fillColor
      fillTracked(ctx, line, x, y, trackingPx)
    }

    y += lineH
  }
}

function drawBadge(ctx: CanvasRenderingContext2D, item: TextItem) {
  const preset = item.badgeVariant
    ? getBadgePreset(item.badgeVariant)
    : null
  const box = toPx(item.rect)
  const accent = preset?.bg ?? "#C41E3A"
  const font = getThumbnailFont(item.fontId || "montserrat")
  const label = (item.uppercase ? item.text.toUpperCase() : item.text).trim()
  const fontSize = Math.max(13, Math.min(box.h * 0.38, 22) * item.sizeScale)
  const tracking = fontSize * 0.18
  const radius = 4
  const sq = Math.min(10, Math.max(8, box.h * 0.3))

  ctx.font = `700 ${fontSize}px ${font.stack}`
  const labelW = measureTrackedWidth(ctx, label || "BADGE", tracking)
  const pillW = Math.min(box.w, 10 + sq + 8 + labelW + 14)
  const pillH = Math.max(box.h, fontSize + 16)
  const pillX = box.x
  const pillY = box.y

  // Fond verre sombre
  roundRect(ctx, pillX, pillY, pillW, pillH, radius)
  ctx.fillStyle = "rgba(8,6,14,0.72)"
  ctx.fill()
  roundRect(ctx, pillX, pillY, pillW, pillH, radius)
  ctx.strokeStyle = "rgba(255,255,255,0.14)"
  ctx.lineWidth = 1
  ctx.stroke()

  // Carré accent + label
  const sqX = pillX + 10
  const sqY = pillY + (pillH - sq) / 2
  ctx.fillStyle = accent
  ctx.fillRect(sqX, sqY, sq, sq)

  ctx.font = `700 ${fontSize}px ${font.stack}`
  ctx.textBaseline = "middle"
  ctx.fillStyle = "#FFFFFF"
  let cursor = sqX + sq + 8
  const ty = pillY + pillH / 2 + 0.5
  for (const ch of label || "BADGE") {
    ctx.fillText(ch, cursor, ty)
    cursor += ctx.measureText(ch).width + tracking
  }
}

export type ComposeInput = {
  state: ThumbnailEditorState
  template?: ThumbnailTemplate
}

export async function composeThumbnailToCanvas(
  canvas: HTMLCanvasElement,
  input: ComposeInput,
): Promise<void> {
  const template = input.template ?? getThumbnailTemplate(input.state.templateId)
  const { state } = input
  const effects: ThumbnailEffects = {
    ...DEFAULT_EFFECTS,
    ...(template.effects ?? {}),
    ...state.effects,
  }

  const fontIds = new Set(
    state.texts
      .map((t) => t.fontId || "lecalme")
      .concat("lecalme", "montserrat"),
  )
  await Promise.all([...fontIds].map((id) => ensureThumbnailFont(id)))

  canvas.width = THUMB_W
  canvas.height = THUMB_H
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas 2D indisponible")

  ctx.clearRect(0, 0, THUMB_W, THUMB_H)
  ctx.fillStyle = "#12081f"
  ctx.fillRect(0, 0, THUMB_W, THUMB_H)

  const bg = state.layers.background
  if (bg.visible && state.backgroundUrl) {
    try {
      const img = await loadImage(state.backgroundUrl)
      ctx.save()
      ctx.beginPath()
      ctx.rect(0, 0, THUMB_W, THUMB_H)
      ctx.clip()
      drawFitted(ctx, img, bg.rect, "cover")
      ctx.restore()
    } catch {
      // fond manquant
    }
  }

  drawBgEffects(ctx, effects)

  if (state.titleBand?.visible) {
    const b = toPx(state.titleBand)
    ctx.fillStyle = state.titleBand.color
    ctx.fillRect(b.x, b.y, b.w, b.h)
  }

  const head = state.layers.head
  if (head.visible && state.headUrl) {
    try {
      const img = await loadImage(state.headUrl)
      const shadow = effects.headShadow
        ? {
            blur: effects.headShadowBlur,
            opacity: effects.headShadowOpacity,
          }
        : null
      drawFitted(ctx, img, head.rect, state.headFit, shadow)
    } catch {
      // ignore
    }
  }

  const prop = state.layers.prop
  if (prop.visible && state.propUrl) {
    try {
      const img = await loadImage(state.propUrl)
      drawFitted(ctx, img, prop.rect, state.propFit, {
        blur: 16,
        opacity: 0.35,
      })
    } catch {
      // ignore
    }
  }

  for (const item of state.texts) {
    if (!item.visible) continue
    if (item.kind === "badge") {
      drawBadge(ctx, item)
      continue
    }
    const style: TitleStyle = {
      ...template.title.style,
      align: item.align,
      color: item.color,
      strokeColor: item.stroke,
      maxWidth: 1,
    }
    drawPlainText(ctx, item.text || "TEXTE", item.rect, style, item.sizeScale, {
      fontId: item.fontId || "lecalme",
      italic: item.italic,
      uppercase: item.uppercase,
      strokeWidth: item.strokeWidth,
      fillMode: item.fillMode ?? "outline",
      tightTracking: item.tightTracking ?? true,
    })
  }
}

export async function exportThumbnailPng(
  state: ThumbnailEditorState,
  filename?: string,
): Promise<void> {
  const canvas = document.createElement("canvas")
  await composeThumbnailToCanvas(canvas, { state })
  await new Promise<void>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Export PNG échoué"))
        return
      }
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      const stamp = new Date().toISOString().slice(0, 10)
      a.href = url
      a.download = filename ?? `miniature-lecalme-${stamp}.png`
      a.click()
      URL.revokeObjectURL(url)
      resolve()
    }, "image/png")
  })
}

function layerFromRect(rect: RelRect, visible = true): LayerState {
  return { rect: { ...rect }, visible, locked: false }
}

export function layersFromTemplate(
  template: ThumbnailTemplate,
): ThumbnailEditorState["layers"] {
  return {
    background: layerFromRect(template.background, true),
    head: layerFromRect(template.head, true),
    prop: layerFromRect(template.prop, true),
  }
}

/**
 * Démo Bryan — calquée sur ta ref :
 * REDIFF · UNE NOUVELLE (outline) · AVENTURE (plein) · voile bas-gauche.
 */
export function defaultEditorState(): ThumbnailEditorState {
  const template = getThumbnailTemplate("bryan-cine")
  return {
    templateId: template.id,
    backgroundUrl: "/thumbnails/demo/bg-griffin-sunset.jpg",
    headUrl: "/thumbnails/demo/head-bryan-hearts.png",
    propUrl: null,
    headFit: "contain",
    propFit: template.prop.fit,
    layers: {
      background: {
        rect: { x: 0, y: 0, w: 1, h: 1 },
        visible: true,
        locked: false,
      },
      head: {
        rect: { x: 0.48, y: 0.18, w: 0.54, h: 0.88 },
        visible: true,
        locked: false,
      },
      prop: layerFromRect(template.prop, false),
    },
    texts: [
      createBadgeItem("rediff", { x: 0.04, y: 0.06, w: 0.2, h: 0.055 }),
      createTextItem({
        text: "UNE NOUVELLE",
        fontId: "lecalme",
        color: "transparent",
        stroke: "rgba(255,255,255,0.95)",
        strokeWidth: 2.5,
        sizeScale: 0.58,
        align: "left",
        italic: true,
        uppercase: true,
        fillMode: "outline",
        tightTracking: true,
        rect: { x: 0.04, y: 0.52, w: 0.5, h: 0.12 },
      }),
      createTextItem({
        text: "AVENTURE",
        fontId: "lecalme",
        color: "#FFFFFF",
        stroke: "transparent",
        strokeWidth: 0,
        sizeScale: 1.12,
        align: "left",
        italic: true,
        uppercase: true,
        fillMode: "solid",
        tightTracking: true,
        rect: { x: 0.04, y: 0.64, w: 0.52, h: 0.24 },
      }),
    ],
    titleBand: null,
    effects: {
      ...DEFAULT_EFFECTS,
      leftShade: 0.35,
      textVeil: 0.78,
      vignette: 0.18,
      headShadow: true,
      headShadowBlur: 26,
      headShadowOpacity: 0.45,
    },
  }
}

export function applyTemplateToState(
  prev: ThumbnailEditorState,
  templateId: string,
): ThumbnailEditorState {
  const template = getThumbnailTemplate(templateId)
  const previousMain = prev.texts.find((t) => t.kind === "text")
  const badges = prev.texts.filter((t) => t.kind === "badge")
  const main = textFromTemplate(template)
  if (previousMain) {
    main.text = previousMain.text
    main.fontId = previousMain.fontId
    main.color = previousMain.color
    main.stroke = previousMain.stroke
    main.strokeWidth = previousMain.strokeWidth
    main.sizeScale = previousMain.sizeScale
    main.italic = previousMain.italic
    main.uppercase = previousMain.uppercase
  }
  return {
    ...prev,
    templateId,
    headFit: template.head.fit,
    propFit: template.prop.fit,
    layers: layersFromTemplate(template),
    texts: [main, ...badges],
    titleBand: template.titleBand
      ? { ...template.titleBand, visible: true }
      : null,
    effects: {
      ...prev.effects,
      ...(template.effects ?? {}),
    },
  }
}

