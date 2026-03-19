export type ChallengeId = string

export type Challenge = {
  id: ChallengeId
  title: string
  description?: string
  reward?: string
  current?: number
  target?: number
  unit?: string
  updatedAt: number
}

