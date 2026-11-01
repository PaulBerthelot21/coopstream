/**
 * Capture LE CALME avec le vrai rendu CSS (outline / italic / system UI)
 * → public/overlays/lecalme-rebrand/scene-chat-bg-brand.(png|jpg)
 *
 * Usage: node scripts/export-scene-chat-bg-brand.mjs
 */
import { pathToFileURL } from "node:url"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")
const htmlPath = path.join(__dirname, "export-scene-chat-bg-brand.html")
const outDir = path.join(root, "public/overlays/lecalme-rebrand")
const outPng = path.join(outDir, "scene-chat-bg-brand.png")
const outJpg = path.join(outDir, "scene-chat-bg-brand.jpg")

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 1,
})

await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle" })
await page.waitForSelector(".brand")
await page.evaluate(async () => {
  await document.fonts.ready
  // force load Geist Black
  try {
    await document.fonts.load('900 41.6px "GeistExport"')
  } catch {
    // ignore
  }
})
await page.waitForTimeout(500)

const el = page.locator("#capture")
await el.screenshot({ path: outPng, type: "png" })
await el.screenshot({ path: outJpg, type: "jpeg", quality: 92 })

await browser.close()

console.log("OK")
console.log(" ", outJpg)
console.log(" ", outPng)
