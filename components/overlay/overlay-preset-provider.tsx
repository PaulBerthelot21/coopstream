"use client"

import * as React from "react"
import { OVERLAY_PRESET_STORAGE_KEY, type OverlayPreset } from "@/lib/overlay/presets"

type PresetContext = { preset: OverlayPreset; selectPreset: (preset: OverlayPreset) => void }
const Context = React.createContext<PresetContext | null>(null)

// The old violet preset remains supported in OBS URLs, but the workspace
// groups both versions of Bryan's identity under the current rebrand.
function workspacePreset(raw: string | null): OverlayPreset {
  return raw === "lecalme" || raw === "lecalme-rebrand" ? "lecalme-rebrand" : "default"
}

export function OverlayPresetProvider({ children }: { children: React.ReactNode }) {
  const [preset, setPreset] = React.useState<OverlayPreset>("default")
  React.useEffect(() => {
    try { setPreset(workspacePreset(localStorage.getItem(OVERLAY_PRESET_STORAGE_KEY))) } catch { /* Storage is optional. */ }
    const sync = (event: StorageEvent) => {
      if (event.key === OVERLAY_PRESET_STORAGE_KEY || event.key === null) setPreset(workspacePreset(event.newValue))
    }
    window.addEventListener("storage", sync)
    return () => window.removeEventListener("storage", sync)
  }, [])
  const selectPreset = React.useCallback((next: OverlayPreset) => {
    const value = workspacePreset(next)
    setPreset(value)
    try { localStorage.setItem(OVERLAY_PRESET_STORAGE_KEY, value) } catch { /* Keep switching available without storage. */ }
  }, [])
  return <Context.Provider value={{ preset, selectPreset }}>{children}</Context.Provider>
}

export function useOverlayPreset() {
  const context = React.useContext(Context)
  if (!context) throw new Error("useOverlayPreset requires OverlayPresetProvider")
  return context
}
