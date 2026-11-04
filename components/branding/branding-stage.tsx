"use client"

import * as React from "react"
import type { BrandingBox } from "@/lib/branding/render"

type Change = { x?: number; y?: number; scale?: number }
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

export function BrandingStage({ canvasRef, boxes, selected, onSelect, onChange, onStart, onEnd, round, guides, avatar, zoom }: {
  canvasRef: React.RefObject<HTMLCanvasElement | null>; boxes: BrandingBox[]; selected: string
  onSelect: (id: string) => void; onChange: (id: string, change: Change) => void; onStart: () => void; onEnd: () => void
  round: boolean; guides: boolean; avatar: boolean; zoom: number
}) {
  const stageRef = React.useRef<HTMLDivElement>(null)
  const drag = React.useRef<{ box: BrandingBox; mode: "move" | "resize"; startX: number; startY: number; centerX: number; centerY: number; distance: number; width: number; height: number } | null>(null)
  const [snapping, setSnapping] = React.useState({ x: false, y: false })

  function begin(event: React.PointerEvent<HTMLElement>, box: BrandingBox, mode: "move" | "resize") {
    event.stopPropagation()
    onSelect(box.id)
    if (box.locked || event.button !== 0) return
    const rect = stageRef.current!.getBoundingClientRect()
    const centerX = rect.left + box.x / 100 * rect.width, centerY = rect.top + box.y / 100 * rect.height
    drag.current = { box, mode, startX: event.clientX, startY: event.clientY, centerX, centerY, distance: Math.max(1, Math.hypot(event.clientX - centerX, event.clientY - centerY)), width: rect.width, height: rect.height }
    onStart()
    event.currentTarget.setPointerCapture(event.pointerId)
    event.currentTarget.focus()
  }
  function move(event: React.PointerEvent<HTMLElement>) {
    const active = drag.current
    if (!active) return
    if (active.mode === "resize") {
      onChange(active.box.id, { scale: Math.hypot(event.clientX - active.centerX, event.clientY - active.centerY) / active.distance })
      return
    }
    let x = clamp(active.box.x + (event.clientX - active.startX) / active.width * 100, 0, 100)
    let y = clamp(active.box.y + (event.clientY - active.startY) / active.height * 100, 0, 100)
    const snapX = !event.altKey && Math.abs(x - 50) < .8, snapY = !event.altKey && Math.abs(y - 50) < .8
    if (snapX) x = 50
    if (snapY) y = 50
    setSnapping({ x: snapX, y: snapY }); onChange(active.box.id, { x, y })
  }
  function end() { if (drag.current) onEnd(); drag.current = null; setSnapping({ x: false, y: false }) }

  return <div className="flex min-h-[420px] items-center justify-center overflow-auto bg-[#090c13] p-8 sm:p-12" data-testid="branding-workspace">
    <div className="shrink-0" style={{ width: `${zoom}%`, maxWidth: avatar ? 520 * zoom / 100 : undefined }}>
      <div ref={stageRef} data-testid="branding-stage" className="relative isolate w-full select-none shadow-[0_16px_80px_#0008]" style={{ backgroundImage: "conic-gradient(#ffffff14 25%, #ffffff06 0 50%, #ffffff14 0 75%, #ffffff06 0)", backgroundSize: "20px 20px" }} onPointerDown={() => onSelect("background")}>
        <canvas ref={canvasRef} aria-label={avatar ? "Composition de la photo de profil" : "Composition de la bannière"} role="img" className="block h-auto w-full" />
        {boxes.map(box => <div key={box.id} role="button" tabIndex={0} aria-label={`Sélectionner ${box.label}`} aria-pressed={selected === box.id} data-layer-id={box.id}
          className={`absolute touch-none outline-none ${box.locked ? "cursor-not-allowed" : "cursor-move"} ${selected === box.id ? "z-20 ring-2 ring-violet-400" : "hover:ring-1 hover:ring-white/60 focus-visible:ring-2 focus-visible:ring-violet-400"}`}
          style={{ left: `${box.x}%`, top: `${box.y}%`, width: `${box.width}%`, height: `${box.height}%`, transform: `translate(-50%, -50%) rotate(${box.rotation}deg)` }}
          onFocus={() => onSelect(box.id)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(box.id) } }}
          onPointerDown={e => begin(e, box, "move")} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end}>
          {selected === box.id && <><span className="pointer-events-none absolute -top-7 left-0 max-w-[160px] truncate rounded bg-violet-500 px-2 py-1 text-[10px] font-medium text-white">{box.label}</span>{!box.locked && ([['left-0 top-0', 'nw'], ['right-0 top-0', 'ne'], ['left-0 bottom-0', 'sw'], ['right-0 bottom-0', 'se']] as const).map(([position, corner]) => <button key={corner} type="button" aria-label={`Redimensionner ${box.label} ${corner}`} className={`absolute ${position} h-3 w-3 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize rounded-sm border-2 border-violet-500 bg-white shadow`} style={{ transform: `translate(${corner.includes('e') ? '50%' : '-50%'}, ${corner.includes('s') ? '50%' : '-50%'})` }} onPointerDown={e => begin(e, box, "resize")} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end} />)}</>}
        </div>)}
        {guides && <div aria-hidden="true" className={`pointer-events-none absolute z-30 border border-dashed border-white/60 ${avatar ? "inset-[10%] rounded-full" : "inset-x-[20%] inset-y-[35%]"}`} />}
        {round && avatar && <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-30 rounded-full ring-[100px] ring-[#090c13]/80 outline outline-1 outline-white/40" />}
        {snapping.x && <div className="pointer-events-none absolute inset-y-0 left-1/2 z-40 border-l border-fuchsia-400" />}
        {snapping.y && <div className="pointer-events-none absolute inset-x-0 top-1/2 z-40 border-t border-fuchsia-400" />}
      </div>
    </div>
  </div>
}
