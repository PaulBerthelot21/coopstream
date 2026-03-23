import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import type { Challenge } from "@/lib/types/challenge"

function toChallenge(external: {
  externalId: string
  title: string
  description: string | null
  reward: string | null
  current: number | null
  target: number | null
  unit: string | null
  skinImageUrl: string | null
  clientUpdatedAt: Date
}): Challenge {
  return {
    id: external.externalId,
    title: external.title,
    description: external.description ?? undefined,
    reward: external.reward ?? undefined,
    current: external.current ?? undefined,
    target: external.target ?? undefined,
    unit: external.unit ?? undefined,
    skinImageUrl: external.skinImageUrl ?? undefined,
    updatedAt: external.clientUpdatedAt.getTime(),
  }
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ key: string }> },
) {
  const params = await context.params
  const coopstreamKey = (params.key ?? "").trim()
  if (!coopstreamKey) {
    return NextResponse.json({ error: "key requis" }, { status: 400 })
  }

  try {
    const room = await prisma.coopStreamRoom.findUnique({
      where: { key: coopstreamKey },
      select: {
        id: true,
        selectedChallengeExternalId: true,
        lastRewardText: true,
        lastRewardAt: true,
        followerGoalTitle: true,
        followerGoalTarget: true,
        followerGoalUnit: true,
      },
    })

    if (!room) {
      return NextResponse.json({
        challenges: [] as Challenge[],
        selectedChallengeId: null as string | null,
        lastRewardText: null as string | null,
        lastRewardAt: null as number | null,
        followerGoalTitle: null as string | null,
        followerGoalTarget: null as number | null,
        followerGoalUnit: null as string | null,
      })
    }

    const challenges = await prisma.coopStreamChallenge.findMany({
      where: { roomId: room.id },
      orderBy: { clientUpdatedAt: "desc" },
      select: {
        externalId: true,
        title: true,
        description: true,
        reward: true,
        current: true,
        target: true,
        unit: true,
        skinImageUrl: true,
        clientUpdatedAt: true,
      },
    })

    return NextResponse.json({
      challenges: challenges.map(toChallenge),
      selectedChallengeId: room.selectedChallengeExternalId,
      lastRewardText: room.lastRewardText,
      lastRewardAt: room.lastRewardAt ? room.lastRewardAt.getTime() : null,
      followerGoalTitle: room.followerGoalTitle,
      followerGoalTarget: room.followerGoalTarget,
      followerGoalUnit: room.followerGoalUnit,
    })
  } catch {
    return NextResponse.json(
      { error: "DB indisponible (migrations manquantes ?)" },
      { status: 503 },
    )
  }
}

