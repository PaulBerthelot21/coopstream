import { fittedText } from "./fit-text"
import { drawLiveBadges } from "./badges"
import { drawTimeline } from "./timeline"
import { drawPosters } from "./posters"
import { ensureThumbnailFont, getThumbnailFont } from "@/lib/thumbnails/fonts"
import { DAY_NAMES, PLANNING_FORMATS, planningRows, sortedEvents, channelLabel, shiftDate, weekLabel, type PlanningState } from "./model"

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

function box(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string | CanvasGradient, stroke?: string) {
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
  const side = wide && state.layout === "poster" && state.eventView !== "posters"
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
  while ((lines.length > 2 || lines.some(line => ctx.measureText(line).width > titleW)) && titleSize > 10) {
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

  const rows = planningRows(state)
  const x = side ? 720 : pad
  const rowW = w - x - pad
  const startY = side ? 90 : Math.max(story ? 420 : 350, detailsY + 120)
  const gap = Math.min(story ? 18 : 14, (h - startY - 150) / Math.max(1, rows.length * 5))
  const maxHeight = story ? 154 : wide ? 112 : 104
  const rowSlotH = Math.min(maxHeight, (h - startY - (wide ? 90 : 150) - gap * Math.max(0, rows.length - 1)) / Math.max(1, rows.length))
  if (state.eventView === "posters") {
    await drawPosters(ctx, state, { x, y: startY, width: rowW, height: h - startY - 140, accent, light })
  } else if (state.eventView === "timeline" || state.layout === "timeline") {
    drawTimeline(ctx, state, { x, y: startY, width: rowW, height: h - startY - 145, accent, light, rebrand })
  } else if (state.layout === "columns") {
    const cols = wide ? 7 : 2
    const columnGap = wide ? 14 : 18
    const groups = state.days.map((day, index) => ({ ...day, index })).filter(day => !state.hideOff || day.status !== "off")
    const countRows = Math.ceil(groups.length / cols)
    const cardWidth = (rowW - columnGap * (cols - 1)) / cols
    const groupHeight = (h - startY - 150 - columnGap * Math.max(0, countRows - 1)) / Math.max(1, countRows)
    groups.forEach((group, pos) => {
      const col = pos % cols
      const row = Math.floor(pos / cols)
      const lastWide = !wide && pos === groups.length - 1 && groups.length % 2 === 1
      const cardW = lastWide ? rowW : cardWidth
      const cardX = x + col * (cardWidth + columnGap)
      const events = group.status === "live" ? sortedEvents(group) : group.events.slice(0, 1)
      const slotHeight = (groupHeight - 10 * (events.length - 1)) / events.length
      const cardHeight = Math.max(220, slotHeight)
      events.forEach((event, eventIndex) => {
        const day = { ...event, status: group.status, index: group.index }
        const cardY = startY + row * (groupHeight + columnGap) + eventIndex * (slotHeight + 10)
        ctx.save()
        ctx.translate(0, cardY); ctx.scale(1, slotHeight / cardHeight); ctx.translate(0, -cardY)
        const live = day.status === "live"
        box(ctx, cardX, cardY, cardW, cardHeight, 18, light ? "#ffffff" : rebrand ? "rgba(30,17,56,.88)" : "#191f2d", live ? `${accent}70` : light ? "#dbe0e8" : "#ffffff15")
        const innerX = cardX + 22
        const innerW = cardW - 44
        const compactCard = cardHeight < 250
        const headerBottom = cardY + (compactCard ? 56 : state.showDates ? 85 : 64)
        text(ctx, DAY_NAMES[day.index].toUpperCase(), innerX, cardY + 21, innerW - (state.showDates && compactCard ? 74 : 0), wide ? 23 : 24, live ? fg : muted, 800)
        if (state.showDates) {
          const date = shiftDate(state.weekStart, day.index).slice(5).split("-").reverse().join("/")
          text(ctx, date, compactCard ? cardX + cardW - 80 : innerX, cardY + (compactCard ? 26 : 57), compactCard ? 60 : innerW, compactCard ? 15 : 18, muted, 500)
        }
        ctx.fillStyle = live ? `${accent}65` : light ? "#dbe0e8" : "#ffffff18"
        ctx.fillRect(innerX, headerBottom, innerW, 1)

        const host = channelLabel(day.onOtherChannel ? day.channel : state.creator) || (day.onOtherChannel ? "À préciser" : "Ma chaîne")
        const footerH = compactCard ? 50 : wide ? 76 : 62
        const footerY = cardY + cardHeight - footerH - 12
        const gameY = headerBottom + 12
        const noteSpace = live && day.note.trim() && !compactCard ? 30 : 0
        const contentBottom = live ? footerY - 14 : cardY + cardHeight - 24
        const label = live ? day.game.trim() || "Live à préciser" : day.status === "off" ? "Repos" : "À annoncer"
        fittedText(ctx, label, innerX, gameY, innerW, Math.max(18, contentBottom - gameY - noteSpace), wide ? 34 : 29, live ? fg : muted, live ? 850 : 500)
        if (noteSpace) text(ctx, day.note, innerX, footerY - 36, innerW, 16, muted, 500)

        if (live) {
          // A single quiet footer keeps the title first and the metadata together.
          box(ctx, cardX + 12, footerY, cardW - 24, footerH, 10, light ? "#eef1f5" : "#101723")
          const timeW = wide ? 65 : Math.min(105, innerW * .32)
          const channelW = innerW - timeW - 14
          const timeX = cardX + cardW - 22 - timeW
          const captionsY = footerY + (compactCard ? 7 : 11)
          const valuesY = footerY + (compactCard ? 22 : 29)
          text(ctx, "DIFFUSION", innerX, captionsY, channelW, compactCard ? 9 : 10, muted, 650)
          text(ctx, "HORAIRE", timeX, captionsY, timeW, compactCard ? 9 : 10, muted, 650)
          fittedText(ctx, host, innerX, valuesY, channelW, compactCard ? 22 : 30, compactCard ? 18 : 19, fg, 750)
          fittedText(ctx, day.time, timeX, valuesY, timeW, compactCard ? 22 : 30, compactCard ? 23 : 27, fg, 850)
        }

        ctx.restore()
      })
    })
  } else rows.forEach((day, pos) => {
    const y = startY + pos * (rowSlotH + gap)
    const slotHeight = rowSlotH
    const contentHeight = Math.max(70, rowSlotH)
    ctx.save()
    ctx.translate(0, y); ctx.scale(1, slotHeight / contentHeight); ctx.translate(0, -y)
    const rowH = contentHeight
    const live = day.status === "live"
    const compact = rowH < 85
    box(ctx, x, y, rowW, rowH, 18, light ? live ? "#ffffff" : "#e9ecf2" : live ? rebrand ? "rgba(30,17,56,.88)" : "#191f2d" : "rgba(19,23,34,.55)", live ? `${accent}70` : light ? "#dbe0e8" : "#ffffff15")
    if (live) box(ctx, x, y + 20, 4, rowH - 40, 2, accent)
    const labelW = wide ? 216 : 192
    const dayY = y + (rowH - (state.showDates ? compact ? 47 : 57 : 30)) / 2
    text(ctx, DAY_NAMES[day.index].toUpperCase(), x + 26, dayY, labelW - 36, compact ? 21 : story ? 27 : 23, live ? fg : muted, 800)
    if (state.showDates) text(ctx, shiftDate(state.weekStart, day.index).slice(5).split("-").reverse().join("/"), x + 26, dayY + (compact ? 27 : 34), labelW - 36, compact ? 16 : 18, muted, 500)
    const badgeW = Math.min(470, rowW * .46)
    const contentX = x + labelW
    const contentW = rowW - labelW - (live ? badgeW + 48 : 30)
    const label = live ? day.game.trim() || "Live à préciser" : day.status === "off" ? "Repos" : "À annoncer"
    const host = channelLabel(day.onOtherChannel ? day.channel : state.creator) || (day.onOtherChannel ? "À préciser" : "Ma chaîne")
    const hasNote = live && Boolean(day.note.trim())
    const noteSpace = hasNote ? compact ? 18 : 24 : 0
    fittedText(ctx, label, contentX, y + 12, contentW, rowH - 24 - noteSpace, compact ? 24 : story ? 33 : 29, live ? fg : muted, live ? 800 : 500)
    if (hasNote) text(ctx, day.note, contentX, y + rowH - (compact ? 21 : 29), contentW, compact ? 13 : 16, muted, 500)
    if (live) drawLiveBadges(ctx, host, day.time, x + rowW - badgeW - 24, y + (rowH - (compact ? 46 : 66)) / 2, badgeW, compact ? 46 : 66, { accent, light })
    ctx.restore()
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
