/** Export the standalone title's real browser rendering as an alpha WebM video.
 * Requires a running dev server and ffmpeg (or FFMPEG_PATH).
 */
import { chromium } from "playwright"
import { mkdir, mkdtemp } from "node:fs/promises"
import path from "node:path"
import { spawn } from "node:child_process"

const root = process.cwd()
const work = path.join(root, ".next", "exports")
await mkdir(work, { recursive: true })
const frames = await mkdtemp(path.join(work, "title-"))
const output = path.join(root, "public", "overlays", "lecalme-rebrand", "title-animated.webm")
const browser = await chromium.launch({ headless: true, ...(process.platform === "win32" ? { channel: "msedge" } : {}) })
try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1, reducedMotion: "no-preference" })
  await page.goto(`${process.env.EXPORT_ORIGIN || "http://localhost:3000"}/overlay-brand-title`)
  await page.locator("[data-intro-title]").waitFor()
  await page.evaluate(async () => { await document.fonts.ready })
  await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" })
  await page.waitForFunction(() => document.body.classList.contains("overlay-body"))
  const count = await page.evaluate(() => {
    const animations = document.querySelector("[data-intro-title]").getAnimations({ subtree: true })
    animations.forEach(animation => animation.pause())
    return animations.length
  })
  if (count < 2) throw new Error("Title animations were not found")
  // Record the original entrance followed by the drifting title at 30 fps.
  for (let frame = 0; frame < 216; frame++) {
    await page.evaluate(time => {
      document.querySelector("[data-intro-title]").getAnimations({ subtree: true }).forEach(animation => { animation.currentTime = time })
    }, frame / 30 * 1000)
    await page.screenshot({ path: path.join(frames, `${String(frame).padStart(4, "0")}.png`), omitBackground: true, clip: { x: 0, y: 0, width: 700, height: 620 } })
    if (frame % 36 === 0) console.log(`Frames: ${frame}/216`)
  }
} finally {
  await browser.close()
}

await new Promise((resolve, reject) => {
  const encoder = spawn(process.env.FFMPEG_PATH || "ffmpeg", [
    "-y", "-framerate", "30", "-i", path.join(frames, "%04d.png"),
    "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-auto-alt-ref", "0",
    "-b:v", "0", "-crf", "20", "-metadata:s:v:0", "alpha_mode=1", "-an", output,
  ], { stdio: "inherit", windowsHide: true })
  encoder.on("error", reject)
  encoder.on("close", code => code === 0 ? resolve() : reject(new Error(`Encoder exited with ${code}`)))
})
console.log(`Exported: ${output}`)
