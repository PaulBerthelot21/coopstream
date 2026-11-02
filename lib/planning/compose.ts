import { ensureThumbnailFont, getThumbnailFont } from "@/lib/thumbnails/fonts"
import { DAY_NAMES, PLANNING_FORMATS, channelLabel, shiftDate, weekLabel, type PlanningState } from "./model"

const marble = "/overlays/lecalme-rebrand/scene-chat-bg.png"
let marblePromise: Promise<HTMLImageElement> | undefined
function loadMarble() {
  if (!marblePromise) marblePromise = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => { marblePromise = undefined; reject(new Error("Fond du rebrand indisponible")) }
    img.src = marble
  })
  return marblePromise
}

function box(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string, stroke?: string) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
  ctx.fillStyle = fill
  ctx.fill()
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke() }
}

function text(ctx: CanvasRenderingContext2D, value: string, x: number, y: number, maxWidth: number, size: number, color: string, weight = 600, italic = false, font = "system-ui, sans-serif") {
  ctx.font = `${italic ? "italic " : ""}${weight} ${size}px ${font}`
  ctx.fillStyle = color
  let label = value
  if (ctx.measureText(label).width > maxWidth) {
    while (label.length && ctx.measureText(`${label}…`).width > maxWidth) label = label.slice(0, -1)
    label += "…"
  }
  ctx.fillText(label, x, y)
}

function titleLines(ctx: CanvasRenderingContext2D, value: string, width: number, size: number, font: string, italic: boolean) {
  const words = (value.trim() || "LE PLANNING").toUpperCase().split(/\s+/)
  ctx.font = `${italic ? "italic " : ""}900 ${size}px ${font}`
  const lines: string[] = []
  let line = ""
  for (const word of words) {
    if (line && ctx.measureText(`${line} ${word}`).width > width) { lines.push(line); line = word }
    else line = line ? `${line} ${word}` : word
  }
  if (line) lines.push(line)
  return lines
}

export async function composePlanning(canvas: HTMLCanvasElement, state: PlanningState, userAccent: string) {
  const { width: w, height: h } = PLANNING_FORMATS[state.format]
  const wide = state.format === "landscape"
  const side = wide && state.layout === "poster"
  const story = state.format === "story"
  const rebrand = state.template === "rebrand"
  const light = state.template === "paper"
  const accent = rebrand ? "#ffc4a8" : /^#[0-9a-f]{6}$/i.test(userAccent) ? userAccent : "#4f46e5"
  if (rebrand) await ensureThumbnailFont("lecalme")
  const img = rebrand ? await loadMarble() : null
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Aperçu indisponible")
  const fg = light ? "#161b27" : "#ffffff"
  const muted = light ? "#626b7b" : "#b1b5c3"
  const font = rebrand ? getThumbnailFont("lecalme").stack : "system-ui, sans-serif"
  ctx.textBaseline = "top"
  ctx.fillStyle = light ? "#f5f6fa" : rebrand ? "#140c29" : "#0e121c"
  ctx.fillRect(0, 0, w, h)
  if (img) {
    const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight)
    ctx.drawImage(img, (w - img.naturalWidth * scale) / 2, (h - img.naturalHeight * scale) / 2, img.naturalWidth * scale, img.naturalHeight * scale)
    ctx.fillStyle = "rgba(12,6,28,.42)"
    ctx.fillRect(0, 0, w, h)
  }
  const glow = ctx.createRadialGradient(w * .12, h * .1, 0, w * .12, h * .1, w * .8)
  glow.addColorStop(0, `${accent}${light ? "12" : "25"}`)
  glow.addColorStop(1, `${accent}00`)
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, w, h)
  const pad = wide ? 88 : 64
  text(ctx, "LES RENDEZ-VOUS DE LA SEMAINE", pad, wide ? 90 : 60, wide ? 550 : w - pad * 2, 18, accent, 800)
  const titleW = side ? 555 : w - pad * 2
  let titleSize = wide ? 105 : 94
  let lines = titleLines(ctx, state.title, titleW, titleSize, font, rebrand)
  while ((lines.length > 2 || lines.some(line => ctx.measureText(line).width > titleW)) && titleSize > 38) {
    titleSize -= 2
    lines = titleLines(ctx, state.title, titleW, titleSize, font, rebrand)
  }
  const titleY = side ? 205 : 112
  lines.slice(0, 2).forEach((line, i) => {
    ctx.font = `${rebrand ? "italic " : ""}900 ${titleSize}px ${font}`
    ctx.save()
    ctx.shadowColor = light ? "transparent" : "rgba(0,0,0,.4)"
    ctx.shadowBlur = 24
    ctx.shadowOffsetY = 6
    if (rebrand && i === 0) { ctx.strokeStyle = fg; ctx.lineWidth = 2; ctx.strokeText(line, pad, titleY + i * titleSize * 1.03) }
    else text(ctx, line, pad, titleY + i * titleSize * 1.03, titleW, titleSize, fg, 900, rebrand, font)
    ctx.restore()
  })
  const detailsY = side ? Math.max(455, titleY + lines.length * titleSize * 1.03 + 30) : titleY + lines.length * titleSize * 1.03 + 22
  text(ctx, state.showDates ? weekLabel(state.weekStart) : "CHAQUE SEMAINE", pad, detailsY, titleW, wide ? 24 : 23, accent, 750)
  text(ctx, state.subtitle, pad, detailsY + 48, titleW, 23, muted, 500)

  const rows = state.days.map((day, index) => ({ ...day, index })).filter(day => !state.hideOff || day.status !== "off")
  const x = side ? 720 : pad
  const rowW = w - x - pad
  const startY = side ? 90 : Math.max(story ? 420 : 350, detailsY + 120)
  const gap = story ? 18 : 14
  const maxHeight = story ? 154 : wide ? 112 : 104
  const rowH = Math.min(maxHeight, (h - startY - (wide ? 90 : 150) - gap * Math.max(0, rows.length - 1)) / Math.max(1, rows.length))
  if (state.layout === "columns") {
    const cols = wide ? 7 : 2
    const columnGap = wide ? 14 : 18
    const countRows = Math.ceil(rows.length / cols)
    const cardWidth = (rowW - columnGap * (cols - 1)) / cols
    const cardHeight = (h - startY - 150 - columnGap * Math.max(0, countRows - 1)) / Math.max(1, countRows)
    rows.forEach((day, pos) => {
      const col = pos % cols
      const row = Math.floor(pos / cols)
      const lastWide = !wide && pos === rows.length - 1 && rows.length % 2 === 1
      const cardW = lastWide ? rowW : cardWidth
      const cardX = x + col * (cardWidth + columnGap)
      const cardY = startY + row * (cardHeight + columnGap)
      const live = day.status === "live"
      box(ctx, cardX, cardY, cardW, cardHeight, 18, light ? "#ffffff" : rebrand ? "rgba(30,17,56,.88)" : "#191f2d", live ? `${accent}70` : light ? "#dbe0e8" : "#ffffff15")
      if (live) box(ctx, cardX + 22, cardY, cardW - 44, 4, 2, accent)
      text(ctx, DAY_NAMES[day.index].toUpperCase(), cardX + 22, cardY + 22, cardW - (wide || !live ? 44 : 148), wide ? 23 : 24, live ? fg : muted, 800)
      if (state.showDates) text(ctx, shiftDate(state.weekStart, day.index).slice(5).split("-").reverse().join("/"), cardX + 22, cardY + 57, cardW - 44, 18, muted, 500)
      if (live && !wide) {
        box(ctx, cardX + cardW - 120, cardY + 20, 100, 37, 10, `${accent}20`)
        text(ctx, day.time, cardX + cardW - 108, cardY + 26, 85, 23, light ? fg : accent, 800)
      }
      if (live && wide) text(ctx, day.time, cardX + 22, cardY + 116, cardW - 44, 39, light ? fg : accent, 850)
      const gameY = cardY + (wide ? 196 : state.showDates ? 91 : 76)
      const label = live ? day.game.trim() || "Live à préciser" : day.status === "off" ? "Repos" : "À annoncer"
      const size = wide ? 30 : 26
      ctx.font = `800 ${size}px system-ui, sans-serif`
      const words = label.split(/(?<=-)|\s+/)
      const lines: string[] = []
      let line = ""
      words.forEach(word => {
        if (line && ctx.measureText(`${line} ${word}`).width > cardW - 44) { lines.push(line); line = word }
        else line = line ? `${line} ${word}` : word
      })
      if (line) lines.push(line)
      const maxLines = wide ? 4 : cardHeight > 260 ? 3 : cardHeight >= 195 ? 2 : 1
      lines.slice(0, maxLines).forEach((labelLine, i) => text(ctx, labelLine, cardX + 22, gameY + i * (size + 7), cardW - 44, size, live ? fg : muted, live ? 800 : 500))
      if (live) {
        const host = day.onOtherChannel ? `Chez ${channelLabel(day.channel) || "chaîne à préciser"}` : channelLabel(state.creator) || "Ma chaîne"
        const channelY = wide ? gameY + Math.min(maxLines, lines.length) * (size + 7) + 25 : cardY + cardHeight - (day.note.trim() && cardHeight > 260 ? 68 : 36)
        text(ctx, host, cardX + 22, channelY, cardW - 44, wide ? 20 : 17, accent, 700)
        if (day.note.trim() && (wide || cardHeight > 260)) text(ctx, day.note, cardX + 22, wide ? channelY + 40 : channelY + 30, cardW - 44, 17, muted, 500)
      }
    })
  } else rows.forEach((day, pos) => {
    const y = startY + pos * (rowH + gap)
    const live = day.status === "live"
    const compact = rowH < 85
    box(ctx, x, y, rowW, rowH, 18, light ? live ? "#ffffff" : "#e9ecf2" : live ? rebrand ? "rgba(30,17,56,.88)" : "#191f2d" : "rgba(19,23,34,.55)", live ? `${accent}70` : light ? "#dbe0e8" : "#ffffff15")
    if (live) box(ctx, x, y + 20, 4, rowH - 40, 2, accent)
    const labelW = wide ? 216 : 192
    const dayY = y + (rowH - (state.showDates ? compact ? 47 : 57 : 30)) / 2
    text(ctx, DAY_NAMES[day.index].toUpperCase(), x + 26, dayY, labelW - 36, compact ? 21 : story ? 27 : 23, live ? fg : muted, 800)
    if (state.showDates) text(ctx, shiftDate(state.weekStart, day.index).slice(5).split("-").reverse().join("/"), x + 26, dayY + (compact ? 27 : 34), labelW - 36, compact ? 16 : 18, muted, 500)
    const contentX = x + labelW
    const contentW = rowW - labelW - (live ? 150 : 30)
    const label = live ? day.game.trim() || "Live à préciser" : day.status === "off" ? "Repos" : "À annoncer"
    const host = day.onOtherChannel ? `Chez ${channelLabel(day.channel) || "chaîne à préciser"}` : channelLabel(state.creator)
    const detail = [host, day.note.trim()].filter(Boolean).join(" · ")
    const hasNote = live && Boolean(detail)
    text(ctx, label, contentX, y + (rowH - (hasNote ? compact ? 48 : 61 : compact ? 27 : 34)) / 2, contentW, compact ? 24 : story ? 33 : 29, live ? fg : muted, live ? 800 : 500)
    if (hasNote) text(ctx, detail, contentX, y + rowH / 2 + (compact ? 7 : 11), contentW, compact ? 16 : 18, muted, 500)
    if (live) {
      box(ctx, x + rowW - 132, y + (rowH - 42) / 2, 108, 42, 12, light ? `${accent}15` : `${accent}20`)
      text(ctx, day.time, x + rowW - 118, y + (rowH - 28) / 2, 85, 25, light ? fg : accent, 800)
    }
  })
  if (!rows.length) text(ctx, "Une pause cette semaine.", x, startY + 70, rowW, 36, muted, 600)
  ctx.fillStyle = light ? "#d9dfe9" : "#ffffff22"
  ctx.fillRect(pad, h - 102, w - pad * 2, 1)
  text(ctx, state.creator.trim() || "À très vite en live", pad, h - 72, w - pad * 2 - 200, 24, fg, 750)
  text(ctx, "HORAIRES DE PARIS", w - pad - 210, h - 67, 210, 15, muted, 600)
}

export async function exportPlanning(state: PlanningState, accent: string, format: "png" | "jpeg") {
  const canvas = document.createElement("canvas")
  await composePlanning(canvas, state, accent)
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error("Export impossible")), `image/${format}`, .94))
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `planning-${state.showDates ? state.weekStart : "semaine-type"}-${state.format}.${format === "jpeg" ? "jpg" : "png"}`
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
