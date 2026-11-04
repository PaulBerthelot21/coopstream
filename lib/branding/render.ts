export const BANNER_FORMATS = {
  wide: { label: "Grande bannière · 2560 × 1440", width: 2560, height: 1440 },
  compact: { label: "Bannière compacte · 1200 × 480", width: 1200, height: 480 },
  panoramic: { label: "Panoramique · 1500 × 500", width: 1500, height: 500 },
} as const

export type BrandingAsset = {
  id: string; name: string; image: string; x: number; y: number
  size: number; rotation: number; opacity: number
  hidden?: boolean; locked?: boolean
}

export type BrandingTextStyle = { x: number; y: number; size: number; rotation: number; color: string }
export type BrandingShape = "circle" | "rounded" | "square"
export type BrandingBox = { id: string; label: string; x: number; y: number; width: number; height: number; rotation: number; locked?: boolean }
export function defaultTextStyle(avatar: boolean, subtitle = false): BrandingTextStyle {
  return { x: 50, y: subtitle ? 58 : avatar ? 50 : 46, size: 100, rotation: 0, color: "#ffffff" }
}

export type BrandingDesign = {
  title: string; subtitle: string; accent: string; background: string
  template: "glow" | "minimal" | "diagonal"; image: string
  zoom: number; offsetX: number; offsetY: number; overlay: number
  format: keyof typeof BANNER_FORMATS; transparent: boolean
  assets: BrandingAsset[]
  titleStyle?: BrandingTextStyle; subtitleStyle?: BrandingTextStyle
  shape?: BrandingShape
}

const imageCache = new Map<string, Promise<HTMLImageElement>>()
function load(source: string) {
  const cached = imageCache.get(source)
  if (cached) return cached
  const result = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => { imageCache.delete(source); reject(new Error("Impossible de charger le visuel.")) }
    img.src = source
  })
  if (imageCache.size >= 24) imageCache.delete(imageCache.keys().next().value!)
  imageCache.set(source, result)
  return result
}

export async function renderBranding(canvas: HTMLCanvasElement, design: BrandingDesign, avatar: boolean, shape: BrandingShape = "square") {
  const [image, assets] = await Promise.all([
    design.image ? load(design.image) : undefined,
    Promise.all(design.assets.map(async asset => ({ ...asset, source: await load(asset.image) }))),
  ])
  const { width: w, height: h } = avatar ? { width: 1024, height: 1024 } : BANNER_FORMATS[design.format]
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Aperçu indisponible.")
  const boxes: BrandingBox[] = []
  if (!avatar || !design.transparent) {
    ctx.fillStyle = design.background; ctx.fillRect(0, 0, w, h)
    if (design.template === "glow") {
      const glow = ctx.createRadialGradient(w * .65, h * .3, 0, w * .65, h * .3, w * .85)
      glow.addColorStop(0, `${design.accent}bb`); glow.addColorStop(1, `${design.accent}00`)
      ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h)
    }
    if (design.template === "diagonal") {
      ctx.fillStyle = `${design.accent}65`
      ctx.beginPath(); ctx.moveTo(w * .5, 0); ctx.lineTo(w, 0); ctx.lineTo(w, h); ctx.lineTo(w * .2, h); ctx.closePath(); ctx.fill()
    }
  }
  if (image) {
    const scale = Math.max(w / image.naturalWidth, h / image.naturalHeight) * design.zoom
    const iw = image.naturalWidth * scale, ih = image.naturalHeight * scale
    ctx.drawImage(image, (w - iw) / 2 + (iw - w) * design.offsetX / 200, (h - ih) / 2 + (ih - h) * design.offsetY / 200, iw, ih)
    if (design.overlay > 0) { ctx.fillStyle = `rgba(0,0,0,${design.overlay / 100})`; ctx.fillRect(0, 0, w, h) }
  }
  for (const asset of assets) {
    if (asset.hidden) continue
    const scale = Math.min(w, h) * asset.size / 100 / Math.max(asset.source.naturalWidth, asset.source.naturalHeight)
    const aw = asset.source.naturalWidth * scale, ah = asset.source.naturalHeight * scale
    boxes.push({ id: asset.id, label: asset.name, x: asset.x, y: asset.y, width: aw / w * 100, height: ah / h * 100, rotation: asset.rotation, locked: asset.locked })
    ctx.save()
    ctx.translate(w * asset.x / 100, h * asset.y / 100)
    ctx.rotate(asset.rotation * Math.PI / 180)
    ctx.globalAlpha = asset.opacity / 100
    ctx.drawImage(asset.source, -aw / 2, -ah / 2, aw, ah)
    ctx.restore()
  }
  ctx.textAlign = "center"; ctx.textBaseline = "middle"
  const title = design.title.trim()
  const maxWidth = avatar ? w * .68 : w * .56
  const titleSize = avatar ? 260 : Math.min(h * .2, w * .065)
  const label = (id: string, value: string, style: BrandingTextStyle, size: number, weight: number) => {
    if (!value) return
    ctx.font = `${weight} ${size}px system-ui, sans-serif`
    while (ctx.measureText(value).width > maxWidth && size > 8) { size -= 1; ctx.font = `${weight} ${size}px system-ui, sans-serif` }
    size *= style.size / 100
    ctx.font = `${weight} ${size}px system-ui, sans-serif`
    boxes.push({ id, label: value, x: style.x, y: style.y, width: Math.max(30, ctx.measureText(value).width) / w * 100, height: size * 1.2 / h * 100, rotation: style.rotation })
    ctx.save(); ctx.translate(w * style.x / 100, h * style.y / 100); ctx.rotate(style.rotation * Math.PI / 180)
    ctx.fillStyle = style.color; ctx.shadowColor = "#00000090"; ctx.shadowBlur = 12
    ctx.fillText(value, 0, 0); ctx.restore()
  }
  label("title", title, design.titleStyle ?? defaultTextStyle(avatar), titleSize, 900)
  if (!avatar && design.subtitle) label("subtitle", design.subtitle, design.subtitleStyle ?? defaultTextStyle(avatar, true), Math.min(h * .07, w * .023), 500)
  if (design.template !== "minimal" && (!avatar || !design.transparent)) {
    ctx.fillStyle = design.accent
    ctx.fillRect(w * .43, h * (avatar ? .74 : .67), w * .14, Math.max(4, h * .008))
  }
  if (avatar && shape !== "square") {
    ctx.save(); ctx.globalCompositeOperation = "destination-in"
    ctx.beginPath()
    if (shape === "circle") ctx.arc(w / 2, h / 2, Math.min(w, h) / 2, 0, Math.PI * 2)
    else ctx.roundRect(0, 0, w, h, Math.min(w, h) * .18)
    ctx.fillStyle = "#ffffff"; ctx.fill(); ctx.restore()
  }
  return boxes
}
