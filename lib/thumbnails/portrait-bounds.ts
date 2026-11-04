type ImageBounds = { x: number; y: number; width: number; height: number }
const cache = new WeakMap<HTMLImageElement, ImageBounds>()

/** Fit the visible portrait, ignoring transparent padding and near-invisible specks. */
export function portraitBounds(image: HTMLImageElement): ImageBounds {
  const cached = cache.get(image)
  if (cached) return cached
  const width = image.naturalWidth || image.width, height = image.naturalHeight || image.height
  const full = { x: 0, y: 0, width, height }
  let result = full
  try {
    const canvas = document.createElement("canvas")
    canvas.width = width; canvas.height = height
    const ctx = canvas.getContext("2d", { willReadFrequently: true })
    if (ctx) {
      ctx.drawImage(image, 0, 0)
      const pixels = ctx.getImageData(0, 0, width, height).data
      let left = width, top = height, right = -1, bottom = -1
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (pixels[(y * width + x) * 4 + 3] < 8) continue
          left = Math.min(left, x); right = Math.max(right, x)
          top = Math.min(top, y); bottom = Math.max(bottom, y)
        }
      }
      if (right >= left && bottom >= top) {
        // Retain a small edge for antialiasing around hair and clothing.
        const x = Math.max(0, left - 2), y = Math.max(0, top - 2)
        result = { x, y, width: Math.min(width, right + 3) - x, height: Math.min(height, bottom + 3) - y }
      }
    }
  } catch { /* A remote image without readable pixels can still use its full frame. */ }
  cache.set(image, result)
  return result
}
