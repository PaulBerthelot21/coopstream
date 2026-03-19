"use client"

import * as React from "react"

import { useCoopStreamStore } from "@/lib/store/coopstream"

// Bump this key whenever the persisted shape/seed behavior changes.
// This avoids OBS/browser sources reusing stale "mock" state.
const STORAGE_KEY = "coopstream-state-v2"
const LEGACY_STORAGE_KEY = "coopstream-state-v1"

type PersistedSlice = Pick<
  ReturnType<typeof useCoopStreamStore.getState>,
  "challenges" | "selectedChallengeId"
>

function loadFromStorage(): PersistedSlice | null {
  if (typeof window === "undefined") return null
  try {
    const rawV2 = window.localStorage.getItem(STORAGE_KEY)
    const rawV1 = window.localStorage.getItem(LEGACY_STORAGE_KEY)
    const raw = rawV2 ?? rawV1
    if (!raw) return null

    const parsed = JSON.parse(raw) as PersistedSlice
    if (!parsed || typeof parsed !== "object") return null
    return parsed
  } catch {
    return null
  }
}

export function useCoopStreamPersistence() {
  React.useEffect(() => {
    const stored = loadFromStorage()
    // OBS peut garder son own cache/localStorage sur des sessions longues.
    // Pour repartir sur un état "neuf", on supporte un reset via query param.
    // Exemple:
    //   /overlay-defi-carrousel?coopstreamReset=1
    let shouldReset = false
    try {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search)
        shouldReset = params.get("coopstreamReset") === "1"
      }
    } catch {
      // ignore
    }

    if (shouldReset) {
      try {
        window.localStorage.removeItem(STORAGE_KEY)
        window.localStorage.removeItem(LEGACY_STORAGE_KEY)
      } catch {
        // ignore
      }
    }

    if (stored) {
      useCoopStreamStore.setState((prev) => ({
        ...prev,
        challenges: stored.challenges ?? prev.challenges,
        selectedChallengeId:
          stored.selectedChallengeId ?? prev.selectedChallengeId,
      }))
    }

    const unsubscribe = useCoopStreamStore.subscribe((state) => {
      const slice: PersistedSlice = {
        challenges: state.challenges,
        selectedChallengeId: state.selectedChallengeId,
      }
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slice))
      } catch {
        // ignore
      }
    })

    return unsubscribe
  }, [])
}

