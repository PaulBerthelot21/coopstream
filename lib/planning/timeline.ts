import { DAY_NAMES, channelLabel, shiftDate, planningRows, sortedEvents, type PlanningEvent, type PlanningState } from "./model"

export function clockMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number)
  return hours * 60 + minutes
}

function clockLabel(minutes: number) {
  const hour = Math.floor(minutes / 60) % 24
  const minute = minutes % 60
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
}

export function timelineBounds(state: PlanningState) {
  const start = clockMinutes(state.timelineStart)
  let end = clockMinutes(state.timelineEnd)
  if (end <= start) end += 1440
  return { start, end, duration: end - start }
}

function slotBounds(day: PlanningEvent, axisStart: number, axisEnd: number) {
  let start = clockMinutes(day.time)
  let end = clockMinutes(day.endTime)
  if (end <= start) end += 1440
  if (start < axisStart && axisEnd > 1440) { start += 1440; end += 1440 }
  return { start, end }
}

export function hiddenTimelineDays(state: PlanningState) {
  const axis = timelineBounds(state)
  return state.days.flatMap((day, index) => {
    if (day.status !== "live") return []
    return day.events.some(event => {
      const slot = slotBounds(event, axis.start, axis.end)
      return slot.start < axis.start || slot.end > axis.end
    }) ? [DAY_NAMES[index]] : []
  })
}

export function autoTimelineRange(state: PlanningState): Pick<PlanningState, "timelineStart" | "timelineEnd"> {
  const live = planningRows(state).filter(day => day.status === "live" && day.time !== day.endTime)
  if (!live.length) return { timelineStart: "16:00", timelineEnd: "02:00" }
  const hasEvening = live.some(day => clockMinutes(day.time) >= 12 * 60)
  const slots = live.map(day => {
    let start = clockMinutes(day.time)
    let end = clockMinutes(day.endTime)
    if (end <= start) end += 1440
    if (hasEvening && start < 6 * 60) { start += 1440; end += 1440 }
    return { start, end }
  })
  const start = Math.floor(Math.min(...slots.map(slot => slot.start)) / 60) * 60
  const end = Math.ceil(Math.max(...slots.map(slot => slot.end)) / 60) * 60
  return { timelineStart: clockLabel(start), timelineEnd: clockLabel(end) }
}

type Bounds = { x: number; y: number; width: number; height: number; accent: string; light: boolean; rebrand: boolean }

function label(ctx: CanvasRenderingContext2D, value: string, x: number, y: number, width: number, size: number, color: string, weight = 600) {
  ctx.font = `${weight} ${size}px system-ui, sans-serif`
  ctx.fillStyle = color
  let shortened = value
  if (ctx.measureText(shortened).width > width) {
    while (shortened.length && ctx.measureText(`${shortened}…`).width > width) shortened = shortened.slice(0, -1)
    shortened += "…"
  }
  ctx.fillText(shortened, x, y)
}

export function drawTimeline(ctx: CanvasRenderingContext2D, state: PlanningState, bounds: Bounds) {
  const { x, y, width, height, accent, light, rebrand } = bounds
  const axis = timelineBounds(state)
  const horizontal = state.timelineAxis === "horizontal"
  const days = state.days.map((day, index) => ({ ...day, index })).filter(day => !state.hideOff || day.status !== "off")
  if (!days.length) { label(ctx, "Une pause cette semaine.", x, y + 50, width, 32, light ? "#626b7b" : "#b1b5c3"); return }
  const fg = light ? "#161b27" : "#ffffff"
  const muted = light ? "#626b7b" : "#b1b5c3"
  const border = light ? "#d6dce7" : "#ffffff20"
  const header = horizontal ? 42 : 72
  const gutter = horizontal ? 140 : 85
  const plotX = x + gutter
  const plotY = y + header
  const plotW = width - gutter
  const plotH = height - header
  const lane = (horizontal ? plotH : plotW) / days.length
  ctx.save()
  ctx.textBaseline = "top"
  ctx.fillStyle = light ? "#ffffff80" : "#0b102044"
  ctx.fillRect(plotX, plotY, plotW, plotH)

  // Hour labels and a lighter half-hour grid.
  for (let minute = axis.start; minute <= axis.end; minute += 30) {
    const fraction = (minute - axis.start) / axis.duration
    const major = (minute - axis.start) % 60 === 0
    ctx.strokeStyle = major ? border : light ? "#e3e7ee" : "#ffffff0b"
    ctx.lineWidth = 1
    ctx.beginPath()
    if (horizontal) {
      const tickX = plotX + fraction * plotW
      ctx.moveTo(tickX, plotY); ctx.lineTo(tickX, plotY + plotH)
      if (major) {
        const tick = `${clockLabel(minute)}${minute >= 1440 ? " +1" : ""}`
        ctx.font = "600 14px system-ui, sans-serif"
        const tickWidth = ctx.measureText(tick).width
        const labelX = Math.min(Math.max(plotX, tickX - tickWidth / 2), plotX + plotW - tickWidth)
        label(ctx, tick, labelX, y + 8, tickWidth + 2, 14, muted)
      }
    } else {
      const tickY = plotY + fraction * plotH
      ctx.moveTo(plotX, tickY); ctx.lineTo(plotX + plotW, tickY)
      if (major) label(ctx, `${clockLabel(minute)}${minute >= 1440 ? " +1" : ""}`, x, tickY - 8, gutter - 8, 14, muted)
    }
    ctx.stroke()
  }

  days.forEach((day, laneIndex) => {
    const date = state.showDates ? shiftDate(state.weekStart, day.index).slice(5).split("-").reverse().join("/") : ""
    const dayX = horizontal ? x : plotX + laneIndex * lane + 9
    const dayY = horizontal ? plotY + laneIndex * lane + (lane - (date ? 47 : 27)) / 2 : y + 5
    label(ctx, DAY_NAMES[day.index].toUpperCase(), dayX, dayY, horizontal ? gutter - 12 : lane - 18, horizontal ? 19 : lane < 150 ? 15 : 21, fg, 800)
    if (date) label(ctx, date, dayX, dayY + 29, horizontal ? gutter - 12 : lane - 18, 15, muted, 500)
    ctx.strokeStyle = border
    ctx.beginPath()
    if (horizontal) { ctx.moveTo(plotX, plotY + (laneIndex + 1) * lane); ctx.lineTo(plotX + plotW, plotY + (laneIndex + 1) * lane) }
    else { ctx.moveTo(plotX + (laneIndex + 1) * lane, plotY); ctx.lineTo(plotX + (laneIndex + 1) * lane, plotY + plotH) }
    ctx.stroke()
    if (day.status !== "live") {
      label(ctx, day.status === "off" ? "Repos" : "À annoncer", horizontal ? plotX + 15 : dayX, horizontal ? plotY + laneIndex * lane + lane / 2 - 10 : plotY + 18, horizontal ? plotW - 30 : lane - 18, 16, muted, 500)
      return
    }
    const trackEnds: number[] = []
    const events = sortedEvents(day).map(event => ({ event, slot: slotBounds(event, axis.start, axis.end) })).sort((a, b) => a.slot.start - b.slot.start).map(item => {
      let track = trackEnds.findIndex(end => end <= item.slot.start)
      if (track < 0) track = trackEnds.length
      trackEnds[track] = item.slot.end
      return { ...item, track }
    })
    const trackLane = lane / Math.max(1, trackEnds.length)
    events.forEach(({ event: live, slot, track }) => {
      const visibleStart = Math.max(axis.start, slot.start)
      const visibleEnd = Math.min(axis.end, slot.end)
      if (visibleEnd <= visibleStart) return
      const offset = (visibleStart - axis.start) / axis.duration
      const duration = (visibleEnd - visibleStart) / axis.duration
      const cardX = horizontal ? plotX + offset * plotW + 2 : plotX + laneIndex * lane + track * trackLane + 7
      const cardY = horizontal ? plotY + laneIndex * lane + track * trackLane + 7 : plotY + offset * plotH + 2
      const cardW = horizontal ? Math.max(2, duration * plotW - 4) : trackLane - 14
      const cardH = horizontal ? trackLane - 14 : Math.max(2, duration * plotH - 4)
      ctx.beginPath()
      ctx.roundRect(cardX, cardY, cardW, cardH, Math.min(10, cardW / 4, cardH / 4))
      ctx.fillStyle = light ? "#ffffff" : rebrand ? "#302047" : "#202b40"
      ctx.fill()
      ctx.strokeStyle = `${accent}bb`
      ctx.lineWidth = 1.5
      ctx.stroke()
      if (cardW < 45 || cardH < 23) return
      ctx.save()
      ctx.beginPath(); ctx.rect(cardX + 3, cardY + 3, cardW - 6, cardH - 6); ctx.clip()
      const padding = cardW < 140 ? 8 : 13
      const insideW = cardW - padding * 2
      label(ctx, `${live.time} – ${live.endTime}`, cardX + padding, cardY + 9, insideW, cardW < 160 ? 12 : 14, muted, 650)
      if (cardH >= 50) label(ctx, live.game.trim() || "Live à préciser", cardX + padding, cardY + 32, insideW, cardW < 150 ? 16 : 22, fg, 850)
      if (cardH >= 76) {
        const host = live.onOtherChannel ? `Chez ${channelLabel(live.channel) || "chaîne à préciser"}` : channelLabel(state.creator) || "Ma chaîne"
        ctx.font = "600 14px system-ui, sans-serif"
        const pillW = Math.min(insideW, ctx.measureText(host).width + 14)
        const pillY = cardY + (cardH >= 115 ? 66 : cardH - 26)
        ctx.beginPath(); ctx.roundRect(cardX + padding, pillY, pillW, 21, 5)
        ctx.fillStyle = `${accent}28`; ctx.fill()
        label(ctx, host, cardX + padding + 6, pillY + 3, pillW - 12, 13, fg, 750)
        if (cardH >= 140 && live.note.trim()) label(ctx, live.note, cardX + padding, pillY + 33, insideW, 13, muted, 500)
      }
      ctx.restore()
    })
  })
  ctx.restore()
}
