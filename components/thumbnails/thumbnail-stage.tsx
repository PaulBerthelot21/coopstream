"use client"

import * as React from "react"

import {
  THUMB_H,
  THUMB_W,
  IMAGE_LAYER_LABELS,
  IMAGE_LAYER_STACK,
  isImageLayerId,
  type ImageLayerId,
  type RelRect,
  type SelectedId,
  type ThumbnailEditorState,
} from "@/lib/thumbnails"

type Handle = "move" | "nw" | "ne" | "sw" | "se" | "n" | "s" | "e" | "w"

const MIN_W = 0.05
const MIN_H = 0.05

function clampRect(r: RelRect): RelRect {
  const w = Math.max(MIN_W, r.w)
  const h = Math.max(MIN_H, r.h)
  return { x: r.x, y: r.y, w, h }
}

function applyHandle(
  start: RelRect,
  handle: Handle,
  dx: number,
  dy: number,
): RelRect {
  let { x, y, w, h } = start
  if (handle === "move") {
    return clampRect({ x: x + dx, y: y + dy, w, h })
  }
  if (handle.includes("w")) {
    const nx = x + dx
    const nw = w - dx
    if (nw >= MIN_W) {
      x = nx
      w = nw
    }
  }
  if (handle.includes("e")) {
    w = Math.max(MIN_W, w + dx)
  }
  if (handle.includes("n")) {
    const ny = y + dy
    const nh = h - dy
    if (nh >= MIN_H) {
      y = ny
      h = nh
    }
  }
  if (handle.includes("s")) {
    h = Math.max(MIN_H, h + dy)
  }
  return clampRect({ x, y, w, h })
}

const HANDLES: { id: Handle; className: string }[] = [
  { id: "nw", className: "left-0 top-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize" },
  { id: "ne", className: "right-0 top-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize" },
  { id: "sw", className: "left-0 bottom-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize" },
  { id: "se", className: "right-0 bottom-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize" },
  { id: "n", className: "left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize" },
  { id: "s", className: "left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 cursor-ns-resize" },
  { id: "w", className: "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize" },
  { id: "e", className: "right-0 top-1/2 translate-x-1/2 -translate-y-1/2 cursor-ew-resize" },
]

type StageItem = {
  id: SelectedId
  label: string
  rect: RelRect
  visible: boolean
  locked: boolean
  accent?: string
}

type Props = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  state: ThumbnailEditorState
  selected: SelectedId | null
  onSelect: (id: SelectedId | null) => void
  onRectChange: (id: SelectedId, rect: RelRect) => void
}

export function ThumbnailStage({
  canvasRef,
  state,
  selected,
  onSelect,
  onRectChange,
}: Props) {
  const stageRef = React.useRef<HTMLDivElement | null>(null)
  const dragRef = React.useRef<{
    id: SelectedId
    handle: Handle
    startRect: RelRect
    originX: number
    originY: number
  } | null>(null)

  const items = React.useMemo((): StageItem[] => {
    const imageItems: StageItem[] = IMAGE_LAYER_STACK.map((id) => ({
      id,
      label: IMAGE_LAYER_LABELS[id],
      rect: state.layers[id].rect,
      visible: state.layers[id].visible && Boolean(id === "background" ? state.backgroundUrl : id === "head" ? state.headUrl : state.propUrl),
      locked: state.layers[id].locked,
    }))
    const textItems: StageItem[] = state.texts.map((t) => ({
      id: t.id,
      label:
        t.kind === "badge"
          ? `Badge ${t.text}`
          : t.text.slice(0, 18) || "Texte",
      rect: t.rect,
      visible: t.visible,
      locked: t.locked,
      accent:
        t.kind === "badge"
          ? t.badgeVariant === "rediff"
            ? "#E11D48"
            : t.badgeVariant === "episode"
              ? "#2563EB"
              : "#EAB308"
          : undefined,
    }))
    return [...imageItems, ...textItems]
  }, [state.layers, state.texts, state.backgroundUrl, state.headUrl, state.propUrl])

  const clientToRel = React.useCallback((clientX: number, clientY: number) => {
    const el = stageRef.current
    if (!el) return { x: 0, y: 0 }
    const box = el.getBoundingClientRect()
    return {
      x: (clientX - box.left) / box.width,
      y: (clientY - box.top) / box.height,
    }
  }, [])

  React.useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const drag = dragRef.current
      if (!drag) return
      const cur = clientToRel(e.clientX, e.clientY)
      const dx = cur.x - drag.originX
      const dy = cur.y - drag.originY
      onRectChange(drag.id, applyHandle(drag.startRect, drag.handle, dx, dy))
    }
    const onUp = () => {
      dragRef.current = null
    }
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
    window.addEventListener("pointercancel", onUp)
    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      window.removeEventListener("pointercancel", onUp)
    }
  }, [clientToRel, onRectChange])

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!selected) return
      const item = items.find((i) => i.id === selected)
      if (!item || item.locked) return
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA") return

      const step = e.shiftKey ? 0.02 : 0.005
      let { x, y } = item.rect
      const { w, h } = item.rect
      if (e.key === "ArrowLeft") x -= step
      else if (e.key === "ArrowRight") x += step
      else if (e.key === "ArrowUp") y -= step
      else if (e.key === "ArrowDown") y += step
      else return
      e.preventDefault()
      onRectChange(selected, clampRect({ x, y, w, h }))
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [selected, items, onRectChange])

  const startDrag = (
    e: React.PointerEvent,
    id: SelectedId,
    handle: Handle,
  ) => {
    e.preventDefault()
    e.stopPropagation()
    const item = items.find((i) => i.id === id)
    if (!item || !item.visible || item.locked) return
    onSelect(id)
    const origin = clientToRel(e.clientX, e.clientY)
    dragRef.current = {
      id,
      handle,
      startRect: { ...item.rect },
      originX: origin.x,
      originY: origin.y,
    }
  }

  return (
    <div
      ref={stageRef}
      className="relative w-full touch-none select-none overflow-hidden rounded-xl border border-border/60 bg-black/80"
      style={{ aspectRatio: `${THUMB_W} / ${THUMB_H}` }}
      onPointerDown={() => onSelect(null)}
    >
      <canvas
        ref={canvasRef}
        width={THUMB_W}
        height={THUMB_H}
        className="pointer-events-none absolute inset-0 h-full w-full"
      />

      {items.map((item) => {
        if (!item.visible) return null
        const isSel = selected === item.id
        const r = item.rect
        const borderColor = isSel
          ? item.accent || "var(--primary)"
          : "transparent"
        return (
          <div
            key={item.id}
            role="button"
            tabIndex={0}
            aria-label={item.label}
            className={[
              "group absolute box-border hover:ring-1 hover:ring-white/30",
              item.locked ? "cursor-not-allowed" : "cursor-move",
              isSel ? "z-20" : "z-10",
            ].join(" ")}
            style={{
              left: `${r.x * 100}%`,
              top: `${r.y * 100}%`,
              width: `${r.w * 100}%`,
              height: `${r.h * 100}%`,
              borderWidth: isSel ? 2 : 1,
              borderStyle: "solid",
              borderColor,
              boxShadow: isSel
                ? `0 0 0 1px ${item.accent || "color-mix(in srgb, var(--primary) 35%, transparent)"}`
                : undefined,
            }}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(item.id) } }}
            onPointerDown={(e) => startDrag(e, item.id, "move")}
          >
            <div
              className={`pointer-events-none absolute left-1 top-1 max-w-[90%] truncate rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${isSel ? "" : "opacity-0 group-hover:opacity-100"}`}
              style={{
                background: isSel
                  ? item.accent || "var(--primary)"
                  : "rgba(0,0,0,0.55)",
                color: isSel && item.accent === "#EAB308" ? "#111" : isSel ? "#fff" : "rgba(255,255,255,0.9)",
              }}
            >
              {item.label}
              {item.locked ? " · 🔒" : ""}
            </div>

            {isSel && !item.locked
              ? HANDLES.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    aria-label={`Resize ${h.id}`}
                    className={[
                      "absolute z-30 h-3 w-3 rounded-sm border border-white/80 shadow",
                      h.className,
                    ].join(" ")}
                    style={{
                      background: item.accent || "var(--primary)",
                    }}
                    onPointerDown={(e) => startDrag(e, item.id, h.id)}
                  />
                ))
              : null}
          </div>
        )
      })}

      <div className="pointer-events-none absolute bottom-2 left-2 rounded bg-black/55 px-2 py-1 text-[10px] text-white/75">
        Glisser · poignées · flèches (Shift = ×4)
        {selected && isImageLayerId(selected as string)
          ? ` · ${IMAGE_LAYER_LABELS[selected as ImageLayerId]}`
          : ""}
      </div>
    </div>
  )
}
