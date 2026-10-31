import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ key: string }> },
) {
  const params = await context.params
  const coopstreamKey = (params.key ?? "").trim()
  if (!coopstreamKey) {
    return NextResponse.json({ text: null }, { status: 400 })
  }

  const room = await prisma.coopStreamRoom.findUnique({
    where: { key: coopstreamKey },
    select: { id: true },
  })

  if (!room) {
    return NextResponse.json({ text: null })
  }

  const items = await prisma.wheelTextChallenge.findMany({
    where: { roomId: room.id },
    orderBy: { createdAt: "desc" },
    select: { text: true },
  })

  if (items.length <= 0) {
    return NextResponse.json({ text: null, candidates: [] as string[] })
  }

  const candidates = items.map((i) => i.text)
  const randomIndex = Math.floor(Math.random() * candidates.length)
  const text = candidates[randomIndex] ?? null

  if (!text) {
    return NextResponse.json({ text: null, candidates })
  }

  // Rotation "casino" (preset default / lecalme).
  const spins = 6 + Math.floor(Math.random() * 4) // 6 à 9 tours
  const randomAngle = Math.floor(Math.random() * 360) // 0 à 359°
  const spinDegrees = spins * 360 + randomAngle

  return NextResponse.json({ text, candidates, spinDegrees })
}

