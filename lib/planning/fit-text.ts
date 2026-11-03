/** Wrap the full value, shrinking only as needed; never replaces a title with ellipses. */
export function fittedText(ctx: CanvasRenderingContext2D, value: string, x: number, y: number, width: number, height: number, maxSize: number, color: string, weight = 800) {
  const wrap = () => {
    const lines: string[] = []
    let line = ""
    for (const word of value.trim().split(/\s+/)) {
      if (ctx.measureText(word).width > width) {
        if (line) { lines.push(line); line = "" }
        for (const char of Array.from(word)) {
          if (line && ctx.measureText(line + char).width > width) { lines.push(line); line = char }
          else line += char
        }
      } else if (line && ctx.measureText(`${line} ${word}`).width > width) {
        lines.push(line); line = word
      } else line = line ? `${line} ${word}` : word
    }
    if (line) lines.push(line)
    return lines
  }
  let size = maxSize
  ctx.font = `${weight} ${size}px system-ui, sans-serif`
  let lines = wrap()
  while ((lines.length * size * 1.12 > height || lines.some(line => ctx.measureText(line).width > width) || (size > 14 && value.trim().split(/\s+/).some(word => ctx.measureText(word).width > width))) && size > 7) {
    size -= .5
    ctx.font = `${weight} ${size}px system-ui, sans-serif`
    lines = wrap()
  }
  const blockH = lines.length * size * 1.12
  const top = y + Math.max(0, (height - blockH) / 2)
  ctx.save()
  ctx.font = `${weight} ${size}px system-ui, sans-serif`
  ctx.textBaseline = "top"
  ctx.fillStyle = color
  lines.forEach((line, index) => ctx.fillText(line, x, top + index * size * 1.12))
  ctx.restore()
  return { height: blockH, size, lines }
}
