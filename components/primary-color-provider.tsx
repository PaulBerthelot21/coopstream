"use client"

import * as React from "react"

type PrimaryColorContextValue = {
  primaryColor: string
  setPrimaryColor: (value: string) => void
}

const STORAGE_KEY = "coopstream-primary-color"

const PrimaryColorContext = React.createContext<PrimaryColorContextValue | undefined>(
  undefined,
)

export function PrimaryColorProvider({ children }: { children: React.ReactNode }) {
  const [primaryColor, setPrimaryColorState] = React.useState<string>("#22c55e")

  React.useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setPrimaryColorState(stored)
        applyColor(stored)
      } else {
        applyColor(primaryColor)
      }
    } catch {
      applyColor(primaryColor)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setPrimaryColor = React.useCallback((value: string) => {
    setPrimaryColorState(value)
    applyColor(value)
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY, value)
      } catch {
        // ignore
      }
    }
  }, [])

  return (
    <PrimaryColorContext.Provider value={{ primaryColor, setPrimaryColor }}>
      {children}
    </PrimaryColorContext.Provider>
  )
}

function applyColor(value: string) {
  if (typeof document === "undefined") return
  const root = document.documentElement
  root.style.setProperty("--primary", value)
  root.style.setProperty("--sidebar-primary", value)
}

export function usePrimaryColor() {
  const ctx = React.useContext(PrimaryColorContext)
  if (!ctx) {
    throw new Error("usePrimaryColor must be used within PrimaryColorProvider")
  }
  return ctx
}

