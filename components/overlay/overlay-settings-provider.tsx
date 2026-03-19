"use client"

import * as React from "react"

type OverlayMode = "bar" | "ticker" | "now-playing" | "scoreboard" | "carousel"

type OverlaySettings = {
  mode: OverlayMode
}

type OverlaySettingsContextValue = {
  settings: OverlaySettings
  setMode: (mode: OverlayMode) => void
}

const STORAGE_KEY = "coopstream-overlay-settings"
const DEFAULT_SETTINGS: OverlaySettings = { mode: "bar" }

const OverlaySettingsContext =
  React.createContext<OverlaySettingsContextValue | undefined>(undefined)

export function OverlaySettingsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [settings, setSettings] =
    React.useState<OverlaySettings>(DEFAULT_SETTINGS)

  React.useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as OverlaySettings
      if (parsed && typeof parsed.mode === "string") {
        setSettings(parsed)
      }
    } catch {
      // ignore
    }
  }, [])

  const setMode = React.useCallback((mode: OverlayMode) => {
    setSettings((prev) => {
      const next = { ...prev, mode }
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        } catch {
          // ignore
        }
      }
      return next
    })
  }, [])

  return (
    <OverlaySettingsContext.Provider value={{ settings, setMode }}>
      {children}
    </OverlaySettingsContext.Provider>
  )
}

export function useOverlaySettings() {
  const ctx = React.useContext(OverlaySettingsContext)
  if (!ctx) {
    throw new Error(
      "useOverlaySettings must be used within OverlaySettingsProvider",
    )
  }
  return ctx
}

