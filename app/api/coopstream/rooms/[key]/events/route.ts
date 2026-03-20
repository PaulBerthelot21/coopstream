import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import type { CoopStreamEvent } from "@/lib/types/events"

function safeNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const n = Number(value)
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

function safeDateFromMs(value: unknown): Date {
  const ms =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : NaN
  const d = new Date(ms)
  return Number.isFinite(d.getTime()) ? d : new Date()
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ key: string }> },
) {
  const params = await context.params
  const coopstreamKey = (params.key ?? "").trim()
  if (!coopstreamKey) {
    return NextResponse.json({ error: "key requis" }, { status: 400 })
  }

  let body: unknown = null
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "body invalide" }, { status: 400 })
  }

  const event = body as Partial<CoopStreamEvent>
  const type = typeof event.type === "string" ? event.type : null
  const payload = (event as any).payload ?? {}

  if (
    !type ||
    ![
      "UPSERT_CHALLENGE",
      "DELETE_CHALLENGE",
      "SELECT_CHALLENGE",
      "UPDATE_PROGRESS",
      "TRIGGER_REWARD",
    ].includes(type)
  ) {
    return NextResponse.json({ error: "type d'event invalide" }, { status: 400 })
  }

  try {
    const room = await prisma.coopStreamRoom.upsert({
      where: { key: coopstreamKey },
      create: { key: coopstreamKey },
      update: {},
      select: { id: true },
    })

    switch (type) {
      case "UPSERT_CHALLENGE": {
        const ch = payload?.challenge ?? null
        const externalId = typeof ch?.id === "string" ? ch.id : ""
        if (!externalId) {
          return NextResponse.json({ error: "challenge.id requis" }, { status: 400 })
        }

        const updatedAt = safeDateFromMs(ch?.updatedAt)

        await prisma.coopStreamChallenge.upsert({
          where: {
            roomId_externalId: {
              roomId: room.id,
              externalId,
            },
          },
          create: {
            roomId: room.id,
            externalId,
            title: typeof ch?.title === "string" ? ch.title : "—",
            description: typeof ch?.description === "string" ? ch.description : null,
            reward: typeof ch?.reward === "string" ? ch.reward : null,
            current:
              typeof ch?.current === "number" ? ch.current : null,
            target:
              typeof ch?.target === "number" ? ch.target : null,
            unit: typeof ch?.unit === "string" ? ch.unit : null,
            skinImageUrl:
              typeof ch?.skinImageUrl === "string" ? ch.skinImageUrl : null,
            clientUpdatedAt: updatedAt,
          },
          update: {
            title: typeof ch?.title === "string" ? ch.title : "—",
            description: typeof ch?.description === "string" ? ch.description : null,
            reward: typeof ch?.reward === "string" ? ch.reward : null,
            current:
              typeof ch?.current === "number" ? ch.current : null,
            target:
              typeof ch?.target === "number" ? ch.target : null,
            unit: typeof ch?.unit === "string" ? ch.unit : null,
            skinImageUrl:
              typeof ch?.skinImageUrl === "string" ? ch.skinImageUrl : null,
            clientUpdatedAt: updatedAt,
          },
        })

        return NextResponse.json({ ok: true })
      }

      case "DELETE_CHALLENGE": {
        const externalId = typeof payload?.id === "string" ? payload.id : null
        if (!externalId) {
          return NextResponse.json({ error: "id requis" }, { status: 400 })
        }

        await prisma.coopStreamChallenge.deleteMany({
          where: { roomId: room.id, externalId },
        })

        await prisma.coopStreamRoom.updateMany({
          where: { id: room.id, selectedChallengeExternalId: externalId },
          data: { selectedChallengeExternalId: null },
        })

        return NextResponse.json({ ok: true })
      }

      case "SELECT_CHALLENGE": {
        const externalId = payload?.id
        const next =
          typeof externalId === "string"
            ? externalId
            : null
        await prisma.coopStreamRoom.update({
          where: { id: room.id },
          data: { selectedChallengeExternalId: next },
        })
        return NextResponse.json({ ok: true })
      }

      case "UPDATE_PROGRESS": {
        const externalId = typeof payload?.id === "string" ? payload.id : null
        if (!externalId) {
          return NextResponse.json({ error: "id requis" }, { status: 400 })
        }
        const nextCurrent = safeNumber(payload?.current)

        await prisma.coopStreamChallenge.update({
          where: {
            roomId_externalId: {
              roomId: room.id,
              externalId,
            },
          },
          data: {
            current: nextCurrent,
            clientUpdatedAt: new Date(),
          },
        })

        return NextResponse.json({ ok: true })
      }

      case "TRIGGER_REWARD": {
        const text = typeof payload?.text === "string" ? payload.text : ""
        await prisma.coopStreamRoom.update({
          where: { id: room.id },
          data: { lastRewardText: text, lastRewardAt: new Date() },
        })
        return NextResponse.json({ ok: true })
      }
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "DB indisponible (migrations manquantes ?)" }, { status: 503 })
  }
}

