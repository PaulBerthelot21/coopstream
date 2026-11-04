"use client"

import * as React from "react"
import type { BrandingDesign } from "@/lib/branding/render"

export function useDesignHistory(initial: BrandingDesign) {
  const [design, render] = React.useState(initial)
  const current = React.useRef(initial)
  const past = React.useRef<BrandingDesign[]>([])
  const future = React.useRef<BrandingDesign[]>([])
  const stamp = React.useRef(0)
  const grouping = React.useRef(false)
  const [availability, setAvailability] = React.useState({ canUndo: false, canRedo: false })
  function refresh() { setAvailability({ canUndo: past.current.length > 0, canRedo: future.current.length > 0 }) }
  function setDesign(action: React.SetStateAction<BrandingDesign>) {
    const next = typeof action === "function" ? action(current.current) : action
    if (next === current.current) return
    if (!grouping.current && Date.now() - stamp.current > 600) {
      past.current = [...past.current.slice(-49), current.current]
    }
    stamp.current = Date.now(); future.current = []; current.current = next; render(next); refresh()
  }
  function beginGesture() {
    past.current = [...past.current.slice(-49), current.current]
    future.current = []; grouping.current = true; refresh()
  }
  function endGesture() { grouping.current = false; stamp.current = 0 }
  function restore(value: BrandingDesign) { current.current = value; past.current = []; future.current = []; render(value); refresh() }
  function undo() {
    const previous = past.current.pop()
    if (!previous) return
    future.current.push(current.current); current.current = previous; stamp.current = 0; grouping.current = false; render(previous); refresh()
  }
  function redo() {
    const next = future.current.pop()
    if (!next) return
    past.current.push(current.current); current.current = next; stamp.current = 0; grouping.current = false; render(next); refresh()
  }
  return { design, setDesign, restore, undo, redo, beginGesture, endGesture, ...availability }
}
