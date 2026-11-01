/** Détourage simple : rend transparent les pixels quasi-noirs (fond studio / export). */

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Impossible de charger ${url}`))
    img.src = url
  })
}

export type CutoutOptions = {
  /** Seuil max RGB (0–255). Plus haut = plus agressif. */
  threshold?: number
  /** Soft edge au-dessus du seuil. */
  soft?: number
}

/**
 * Retourne un data URL PNG avec fond sombre détouré.
 * Utile pour tête / sticker sur fond noir avant placement.
 */
export async function cutoutDarkBackground(
  url: string,
  options: CutoutOptions = {},
): Promise<string> {
  const threshold = options.threshold ?? 28
  const soft = options.soft ?? 20
  const img = await loadImage(url)
  const w = img.naturalWidth || img.width
  const h = img.naturalHeight || img.height
  if (!w || !h) throw new Error("Image vide")

  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d", { willReadFrequently: true })
  if (!ctx) throw new Error("Canvas 2D indisponible")

  ctx.drawImage(img, 0, 0)
  const imageData = ctx.getImageData(0, 0, w, h)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]!
    const g = data[i + 1]!
    const b = data[i + 2]!
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    if (max < threshold) {
      data[i + 3] = 0
      continue
    }
    // Frange sombre neutre
    if (max < threshold + soft && max - min < 14) {
      data[i + 3] = Math.round(((max - threshold) / soft) * (data[i + 3] ?? 255))
    }
  }

  ctx.putImageData(imageData, 0, 0)
  return canvas.toDataURL("image/png")
}
