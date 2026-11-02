type BadgeTheme = { accent: string; light: boolean }

function fit(ctx: CanvasRenderingContext2D, value: string, x: number, y: number, width: number, size: number, color: string, weight: number) {
  ctx.font = `${weight} ${size}px system-ui, sans-serif`
  while (ctx.measureText(value).width > width && size > 11) { size--; ctx.font = `${weight} ${size}px system-ui, sans-serif` }
  let display = value
  if (ctx.measureText(display).width > width) {
    while (display && ctx.measureText(`${display}…`).width > width) display = display.slice(0, -1)
    display += "…"
  }
  ctx.fillStyle = color
  ctx.fillText(display, x, y)
}

function badge(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, title: string, value: string, kind: "channel" | "time", theme: BadgeTheme) {
  const { light } = theme
  const fg = "#101827"
  const muted = "#4b5563"
  const small = kind === "time" ? width < 100 : width < 150
  ctx.save()
  ctx.textBaseline = "top"
  ctx.beginPath()
  ctx.roundRect(x, y, width, height, height > 50 ? 12 : 9)
  ctx.shadowColor = "#00000030"
  ctx.shadowBlur = light ? 4 : 12
  ctx.shadowOffsetY = 3
  ctx.fillStyle = light ? "#eef0f3" : "#f3f4f6"
  ctx.fill()
  ctx.shadowBlur = 0
  ctx.shadowOffsetY = 0
  ctx.strokeStyle = "#cfd5df"
  ctx.lineWidth = 2
  ctx.stroke()
  const inset = small ? 8 : 12
  const textW = width - inset - (small ? 7 : 10)
  fit(ctx, title, x + inset, y + (height > 50 ? 8 : 5), textW, small ? 9 : 11, muted, 750)
  const valueSize = kind === "time" ? small ? 19 : height > 50 ? 30 : 23 : small ? 16 : height > 50 ? 26 : 21
  fit(ctx, value, x + inset, y + (height > 50 ? 26 : 20), textW, valueSize, fg, 900)
  ctx.restore()
}

/** A matched pair: broadcaster on the left, start time on the right. */
export function drawLiveBadges(ctx: CanvasRenderingContext2D, host: string, time: string, x: number, y: number, width: number, height: number, theme: BadgeTheme) {
  const gap = width < 300 ? 6 : 10
  const timeWidth = width < 300 ? Math.max(63, width * .33) : 144
  const channelWidth = width - gap - timeWidth
  badge(ctx, x, y, channelWidth, height, "DIFFUSION", host, "channel", theme)
  badge(ctx, x + channelWidth + gap, y, timeWidth, height, "HORAIRE", time, "time", theme)
}
