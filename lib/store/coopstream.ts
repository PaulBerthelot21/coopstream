import { create } from "zustand"

import type { Challenge, ChallengeId } from "@/lib/types/challenge"
import type { CoopStreamEvent } from "@/lib/types/events"

type CoopStreamState = {
  challenges: Record<ChallengeId, Challenge>
  selectedChallengeId: ChallengeId | null
  lastRewardText: string | null
  lastRewardAt: number | null

  upsertChallenge: (challenge: Challenge) => void
  deleteChallenge: (id: ChallengeId) => void
  selectChallenge: (id: ChallengeId | null) => void
  triggerReward: (text: string) => void
  updateProgress: (id: ChallengeId, current: number) => void

  applyEvent: (event: CoopStreamEvent) => void
}

export const useCoopStreamStore = create<CoopStreamState>((set, get) => ({
  challenges: {},
  selectedChallengeId: null,
  lastRewardText: null,
  lastRewardAt: null,

  upsertChallenge: (challenge) =>
    set((state) => ({
      challenges: { ...state.challenges, [challenge.id]: challenge },
    })),

  deleteChallenge: (id) =>
    set((state) => {
      const next = { ...state.challenges }
      delete next[id]
      const selectedChallengeId =
        state.selectedChallengeId === id ? null : state.selectedChallengeId
      return { challenges: next, selectedChallengeId }
    }),

  selectChallenge: (id) => set({ selectedChallengeId: id }),

  triggerReward: (text) =>
    set({ lastRewardText: text, lastRewardAt: Date.now() }),

  updateProgress: (id, current) =>
    set((state) => {
      const existing = state.challenges[id]
      if (!existing) return state
      return {
        challenges: {
          ...state.challenges,
          [id]: { ...existing, current, updatedAt: Date.now() },
        },
      }
    }),

  applyEvent: (event) => {
    const state = get()
    switch (event.type) {
      case "UPSERT_CHALLENGE":
        state.upsertChallenge(event.payload.challenge)
        return
      case "DELETE_CHALLENGE":
        state.deleteChallenge(event.payload.id)
        return
      case "SELECT_CHALLENGE":
        state.selectChallenge(event.payload.id)
        return
      case "TRIGGER_REWARD":
        state.triggerReward(event.payload.text)
        return
      case "UPDATE_PROGRESS":
        state.updateProgress(event.payload.id, event.payload.current)
        return
    }
  },
}))

export function selectSelectedChallenge(state: ReturnType<typeof useCoopStreamStore.getState>) {
  const { selectedChallengeId, challenges } = state
  return selectedChallengeId ? challenges[selectedChallengeId] ?? null : null
}

