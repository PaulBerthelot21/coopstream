import { fittedText } from "./fit-text"
import { DAY_NAMES, channelLabel, shiftDate, sortedEvents, type PlanningEvent, type PlanningState } from "./model"

type Area = { x: number; y: number; width: number; height: number; accent: string; light: boolean }

function rounded(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, Math.min(r, h / 3, w / 3))
}

export async function drawPosters(ctx: CanvasRenderingContext2D, state: PlanningState, area: Area) {
  const { x, y, width, height, accent, light } = area
  const days = state.days.map((day, index) => ({ ...day, index })).filter(day => !state.hideOff || day.status !== "off")
  const sources = [...new Set(days.filter(day => day.status === "live").flatMap(day => day.events.map(event => event.image)).filter(Boolean))]
  const loaded = await Promise.all(sources.map(src => new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error("Image du planning indisponible"))
    image.src = src
  })))
  const images = new Map(sources.map((src, i) => [src, loaded[i]]))
  const cols = state.format === "landscape" ? Math.max(1, days.length) : 2
  const gap = state.format === "landscape" ? 16 : 20
  const cw = (width - gap * (cols - 1)) / cols
  const fg = light ? "#172033" : "#f7f9ff"
  const muted = light ? "#707b8d" : "#9daac0"
  const rowWeights = Array.from({ length: Math.ceil(days.length / cols) }, (_, row) => Math.max(...days.slice(row * cols, (row + 1) * cols).map(day => day.status === "live" ? day.events.length : 1)))
  // Use one shared image ratio and card size across the week, rather than
  // stretching a single live to fill its day's entire column.
  const ratios = loaded.map(image => image.naturalWidth / image.naturalHeight).sort((a, b) => a - b)
  const imageRatio = Math.max(1, Math.min(2, ratios[Math.floor(ratios.length / 2)] ?? 16 / 9))
  const slots = rowWeights.reduce((sum, count) => sum + count, 0)
  const available = height - rowWeights.length * 58 - Math.max(0, rowWeights.length - 1) * gap
  const eventGap = Math.min(24, available / Math.max(1, slots * 4))
  const eventGaps = rowWeights.reduce((sum, count) => sum + (count - 1) * eventGap, 0)
  const cardHeight = Math.min(Math.max(140, cw / imageRatio), (available - eventGaps) / Math.max(1, slots))
  const rowHeight = (count: number) => 58 + count * cardHeight + (count - 1) * eventGap

  function card(event: PlanningEvent, left: number, top: number, cardH: number) {
    const compact = cardH < 190
    const image = images.get(event.image)
    const inset = cw < 230 ? 13 : 17
    const artW = cw
    const artH = cardH
    const contentX = left + inset
    const contentW = cw - inset * 2
    ctx.save()
    ctx.shadowColor = light ? "#17203315" : "#00000055"
    ctx.shadowBlur = 18; ctx.shadowOffsetY = 7
    rounded(ctx, left, top, cw, cardH, 18)
    ctx.fillStyle = light ? "#ffffff" : "#192337"; ctx.fill()
    ctx.shadowColor = "transparent"
    rounded(ctx, left, top, cw, cardH, 18); ctx.clip()
    const backdrop = ctx.createLinearGradient(left, top, left + artW, top + artH)
    backdrop.addColorStop(0, `${accent}60`); backdrop.addColorStop(1, "#10182b")
    ctx.fillStyle = backdrop; ctx.fillRect(left, top, artW, artH)
    if (image) {
      if (event.imageFit === "contain") {
        // Extend the artwork behind the full image so no empty bands remain.
        const fillScale = Math.max(artW / image.naturalWidth, artH / image.naturalHeight) * 1.15
        ctx.save(); ctx.filter = "blur(16px)"
        ctx.drawImage(image, left + (artW - image.naturalWidth * fillScale) / 2, top + (artH - image.naturalHeight * fillScale) / 2, image.naturalWidth * fillScale, image.naturalHeight * fillScale)
        ctx.restore()
      }
      const scale = (event.imageFit === "cover" ? Math.max : Math.min)(artW / image.naturalWidth, artH / image.naturalHeight)
      ctx.drawImage(image, left + (artW - image.naturalWidth * scale) / 2, top + (artH - image.naturalHeight * scale) / 2, image.naturalWidth * scale, image.naturalHeight * scale)
    } else {
      ctx.fillStyle = `${accent}40`
      ctx.beginPath(); ctx.arc(left + artW * .8, top + artH * .22, artW * .45, 0, Math.PI * 2); ctx.fill()
    }
    const hasNote = !compact && Boolean(event.note.trim())
    const host = channelLabel(event.onOtherChannel ? event.channel : state.creator) || (event.onOtherChannel ? "Chaîne à préciser" : "Ma chaîne")
    const titleH = compact ? 30 : 42
    const overlayH = Math.min(cardH, titleH + (hasNote ? 57 : 35))
    const contentY = top + cardH - overlayH
    const shade = ctx.createLinearGradient(0, Math.max(top, contentY - 22), 0, top + cardH)
    shade.addColorStop(0, "#070c1800"); shade.addColorStop(.35, "#070c1870"); shade.addColorStop(1, "#070c18eb")
    ctx.fillStyle = shade; ctx.fillRect(left, top, artW, artH)
    fittedText(ctx, event.game.trim() || "Live à préciser", contentX, contentY, contentW, titleH, compact ? 20 : 26, "#ffffff", 850)
    if (hasNote) fittedText(ctx, event.note, contentX, contentY + titleH + 3, contentW, 18, 13, "#e1e7f2", 500)
    fittedText(ctx, host, contentX, top + cardH - 23, contentW, 15, 13, "#d1daeb", 600)
    ctx.restore()
    rounded(ctx, left + .5, top + .5, cw - 1, cardH - 1, 18)
    ctx.strokeStyle = light ? "#17203312" : "#ffffff16"; ctx.lineWidth = 1; ctx.stroke()
    // Float above the upper-right edge instead of covering the artwork.
    const timeW = Math.min(cw - 20, 146)
    const timeX = left + cw - timeW - 8
    ctx.save()
    ctx.shadowColor = "#00000040"; ctx.shadowBlur = 12; ctx.shadowOffsetY = 3
    rounded(ctx, timeX, top - 12, timeW, 28, 10)
    ctx.fillStyle = light ? "#ffffff" : "#101827"; ctx.fill()
    ctx.shadowColor = "transparent"
    ctx.strokeStyle = `${accent}80`; ctx.lineWidth = 1; ctx.stroke()
    fittedText(ctx, `${event.time} – ${event.endTime}`, timeX + 8, top - 6, timeW - 16, 16, 14, fg, 750)
    ctx.restore()
  }

  days.forEach((day, pos) => {
    const row = Math.floor(pos / cols)
    const left = x + (pos % cols) * (cw + gap)
    const top = y + rowWeights.slice(0, row).reduce((sum, count) => sum + rowHeight(count) + gap, 0)
    ctx.fillStyle = day.status === "live" ? accent : muted
    ctx.beginPath(); ctx.arc(left + 5, top + 12, 4, 0, Math.PI * 2); ctx.fill()
    fittedText(ctx, DAY_NAMES[day.index].toUpperCase(), left + 18, top, cw - 22, 26, 20, fg, 850)
    if (state.showDates) fittedText(ctx, shiftDate(state.weekStart, day.index).slice(5).split("-").reverse().join("/"), left + 18, top + 29, cw - 22, 17, 14, muted, 550)
    const bodyY = top + 58
    const bodyH = rowHeight(rowWeights[row]) - 58
    if (day.status !== "live") {
      rounded(ctx, left, bodyY, cw, Math.min(bodyH, 160), 18)
      ctx.fillStyle = light ? "#17203305" : "#ffffff04"; ctx.fill()
      ctx.save(); ctx.setLineDash([5, 6]); ctx.strokeStyle = light ? "#17203320" : "#ffffff20"; ctx.stroke(); ctx.restore()
      fittedText(ctx, day.status === "off" ? "Repos" : "À annoncer", left + 16, bodyY + 30, cw - 32, 44, 21, muted, 600)
      return
    }
    const events = sortedEvents(day)
    events.forEach((event, index) => card(event, left, bodyY + index * (cardHeight + eventGap), cardHeight))
  })
}
