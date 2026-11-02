"use client"

import * as React from "react"
import { composeThumbnailToCanvas } from "@/lib/thumbnails/compose-thumbnail"
import type { ThumbnailEditorState } from "@/lib/thumbnails/types"

export function StudioPreview({ state, className = "" }: { state: ThumbnailEditorState; className?: string }) {
  const ref = React.useRef<HTMLCanvasElement>(null)
  React.useEffect(() => {
    let active = true
    const buffer = document.createElement("canvas")
    void composeThumbnailToCanvas(buffer, { state }).then(() => {
      if (!active || !ref.current) return
      ref.current.width = buffer.width
      ref.current.height = buffer.height
      ref.current.getContext("2d")?.drawImage(buffer, 0, 0)
    }).catch(() => {})
    return () => { active = false }
  }, [state])
  return <canvas ref={ref} width={1280} height={720} role="img" aria-label="Aperçu de la miniature" className={`aspect-video w-full ${className}`} />
}
