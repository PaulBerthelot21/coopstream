import type { Challenge, ChallengeId } from "@/lib/types/challenge"

export const COOPSTREAM_CHANNEL = "coopstream"

export type CoopStreamEvent =
  | { type: "UPSERT_CHALLENGE"; payload: { challenge: Challenge } }
  | { type: "DELETE_CHALLENGE"; payload: { id: ChallengeId } }
  | { type: "SELECT_CHALLENGE"; payload: { id: ChallengeId | null } }
  | {
      type: "UPDATE_PROGRESS"
      payload: { id: ChallengeId; current: number }
    }
  | { type: "TRIGGER_REWARD"; payload: { text: string } }
  | {
      type: "UPSERT_FOLLOWER_GOAL"
      payload: { title: string; target: number; unit?: string }
    }

