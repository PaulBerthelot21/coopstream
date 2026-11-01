/**
 * Exporte le fond scène Chat (marbre + voiles CSS) en PNG/JPG 1920×1080.
 * Pour le fond + LE CALME (vraie police) : npm run export:scene-chat-bg-brand
 *
 * Usage: node scripts/export-scene-chat-bg.mjs
 */
import { mkdir } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")
const src = path.join(root, "public/overlays/lecalme-rebrand/background-intro.jpg")
const outDir = path.join(root, "public/overlays/lecalme-rebrand")
const outPng = path.join(outDir, "scene-chat-bg.png")
const outJpg = path.join(outDir, "scene-chat-bg.jpg")

const W = 1920
const H = 1080

const veilSvg = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="100%" height="100%" fill="rgb(12,6,28)" fill-opacity="0.28"/>
  <defs>
    <linearGradient id="veil" gradientUnits="userSpaceOnUse"
      x1="0" y1="${H * 0.42}" x2="${W}" y2="${H * 0.58}">
      <stop offset="0%" stop-color="rgb(6,3,14)" stop-opacity="0.12"/>
      <stop offset="30%" stop-color="rgb(6,3,14)" stop-opacity="0"/>
      <stop offset="52%" stop-color="rgb(6,3,14)" stop-opacity="0"/>
      <stop offset="72%" stop-color="rgb(8,4,18)" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="rgb(4,2,10)" stop-opacity="0.7"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#veil)"/>
</svg>
`)

await mkdir(outDir, { recursive: true })

const base = await sharp(src)
  .resize(W, H, { fit: "cover", position: "centre" })
  .ensureAlpha()
  .toBuffer()

const composed = sharp(base).composite([{ input: veilSvg, blend: "over" }])

await composed.clone().png({ compressionLevel: 9 }).toFile(outPng)
await composed.clone().jpeg({ quality: 92, mozjpeg: true }).toFile(outJpg)

console.log("OK")
console.log(" PNG:", outPng)
console.log(" JPG:", outJpg)
console.log("Brand (police CSS) : npm run export:scene-chat-bg-brand")
