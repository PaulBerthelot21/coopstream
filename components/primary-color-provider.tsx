"use client"

import * as React from "react"

type PrimaryColorContextValue = {
  primaryColor: string
  setPrimaryColor: (value: string) => void
  resetPrimaryColor: () => void
}

const STORAGE_KEY = "coopstream-primary-color"
// Bleu indigo sobre (premium, lisible en clair/sombre)
const DEFAULT_PRIMARY_COLOR = "#4F46E5"

const PrimaryColorContext = React.createContext<PrimaryColorContextValue | undefined>(
  undefined,
)

export function PrimaryColorProvider({ children }: { children: React.ReactNode }) {
  const [primaryColor, setPrimaryColorState] = React.useState<string>(
    DEFAULT_PRIMARY_COLOR,
  )

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

  const resetPrimaryColor = React.useCallback(() => {
    setPrimaryColorState(DEFAULT_PRIMARY_COLOR)
    applyColor(DEFAULT_PRIMARY_COLOR)
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(STORAGE_KEY)
      } catch {
        // ignore
      }
    }
  }, [])

  return (
    <PrimaryColorContext.Provider
      value={{ primaryColor, setPrimaryColor, resetPrimaryColor }}
    >
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

