/** Keep imported artwork small enough for the browser's saved draft. */
export async function importPlanningImage(file: File): Promise<string> {
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) throw new Error("Choisis une image PNG, JPG ou WebP.")
  if (file.size > 20 * 1024 * 1024) throw new Error("L’image doit peser moins de 20 Mo.")
  const url = URL.createObjectURL(file)
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error("Cette image ne peut pas être ouverte."))
      img.src = url
    })
    const scale = Math.min(1, 1000 / Math.max(image.naturalWidth, image.naturalHeight))
    const canvas = document.createElement("canvas")
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Import indisponible.")
    ctx.fillStyle = "#101723"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
    for (const quality of [.86, .72, .55, .38]) {
      const data = canvas.toDataURL("image/jpeg", quality)
      if (data.length <= 600000) return data
    }
    throw new Error("Cette image est trop détaillée. Essaie une version plus petite.")
  } finally { URL.revokeObjectURL(url) }
}
