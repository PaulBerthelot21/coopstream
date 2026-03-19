"use client"

import * as React from "react"

import { useCoopStreamStore } from "@/lib/store/coopstream"
import type { Challenge } from "@/lib/types/challenge"

const STORAGE_KEY = "coopstream-state-v1"

type PersistedSlice = Pick<
  ReturnType<typeof useCoopStreamStore.getState>,
  "challenges" | "selectedChallengeId"
>

function loadFromStorage(): PersistedSlice | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistedSlice
    if (!parsed || typeof parsed !== "object") return null
    return parsed
  } catch {
    return null
  }
}

function buildMockChallenges(): PersistedSlice {
  const now = Date.now()
  const mocks: Array<Omit<Challenge, "updatedAt"> & { updatedAt: number }> = [
    { id: "mock-01", title: "15 kills à l’AWP", current: 3, target: 15, unit: "kills", reward: "Roulette", updatedAt: now - 1000 * 1 },
    { id: "mock-02", title: "10 headshots", current: 2, target: 10, unit: "HS", reward: "1 gorgée", updatedAt: now - 1000 * 2 },
    { id: "mock-03", title: "Gagner un round au pistolet", current: 0, target: 1, unit: "round", reward: "5€", updatedAt: now - 1000 * 3 },
    { id: "mock-04", title: "3 no-scope", current: 1, target: 3, unit: "no-scope", reward: "Punition chat", updatedAt: now - 1000 * 4 },
    { id: "mock-05", title: "Clutch 1v3", current: 0, target: 1, unit: "clutch", reward: "Double roulette", updatedAt: now - 1000 * 5 },
    { id: "mock-06", title: "5 kills au Deagle", current: 1, target: 5, unit: "kills", reward: "On change de map", updatedAt: now - 1000 * 6 },
    { id: "mock-07", title: "Placer 3 smokes utiles", current: 0, target: 3, unit: "smokes", reward: "Team shoutout", updatedAt: now - 1000 * 7 },
    { id: "mock-08", title: "Faire 2 ACE", current: 0, target: 2, unit: "ACE", reward: "Roulette premium", updatedAt: now - 1000 * 8 },
    { id: "mock-09", title: "Survivre 4 rounds d’affilée", current: 2, target: 4, unit: "rounds", reward: "Pas de buy 1 round", updatedAt: now - 1000 * 9 },
    { id: "mock-10", title: "5 assists", current: 4, target: 5, unit: "assists", reward: "1 minute de pause", updatedAt: now - 1000 * 10 },
    { id: "mock-11", title: "3 entries (first kill)", current: 1, target: 3, unit: "entries", reward: "Changement de sensi", updatedAt: now - 1000 * 11 },
    { id: "mock-12", title: "2 kills au couteau", current: 0, target: 2, unit: "knife", reward: "Musique au choix", updatedAt: now - 1000 * 12 },
    { id: "mock-13", title: "10 kills au MP9", current: 6, target: 10, unit: "kills", reward: "Roulette", updatedAt: now - 1000 * 13 },
    { id: "mock-14", title: "Gagner 3 rounds CT d’affilée", current: 1, target: 3, unit: "rounds", reward: "Pas de casque 1 round", updatedAt: now - 1000 * 14 },
    { id: "mock-15", title: "Planter 2 bombes", current: 1, target: 2, unit: "plants", reward: "Viewer choose loadout", updatedAt: now - 1000 * 15 },
    { id: "mock-16", title: "Désamorcer 2 bombes", current: 0, target: 2, unit: "defuses", reward: "Hydratation", updatedAt: now - 1000 * 16 },
    { id: "mock-17", title: "Faire 3000 dmg", current: 1200, target: 3000, unit: "dmg", reward: "Roulette", updatedAt: now - 1000 * 17 },
    { id: "mock-18", title: "2 kills à travers une smoke", current: 0, target: 2, unit: "kills", reward: "Pas de viseur 1 round", updatedAt: now - 1000 * 18 },
    { id: "mock-19", title: "Gagner 1 eco round", current: 0, target: 1, unit: "round", reward: "Challenge bonus", updatedAt: now - 1000 * 19 },
    { id: "mock-20", title: "5 kills en défense de site", current: 2, target: 5, unit: "kills", reward: "Roulette", updatedAt: now - 1000 * 20 },
  ]

  const challenges = Object.fromEntries(mocks.map((c) => [c.id, c])) as PersistedSlice["challenges"]
  return { challenges, selectedChallengeId: mocks[0]?.id ?? null }
}

export function useCoopStreamPersistence() {
  React.useEffect(() => {
    const stored = loadFromStorage()
    if (stored) {
      useCoopStreamStore.setState((prev) => ({
        ...prev,
        challenges: stored.challenges ?? prev.challenges,
        selectedChallengeId:
          stored.selectedChallengeId ?? prev.selectedChallengeId,
      }))
    } else if (process.env.NODE_ENV !== "production") {
      const state = useCoopStreamStore.getState()
      if (Object.keys(state.challenges).length === 0) {
        const seed = buildMockChallenges()
        useCoopStreamStore.setState((prev) => ({
          ...prev,
          challenges: seed.challenges,
          selectedChallengeId: seed.selectedChallengeId,
        }))
      }
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

