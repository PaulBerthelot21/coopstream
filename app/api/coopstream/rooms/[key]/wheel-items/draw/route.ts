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

  const count = await prisma.wheelTextChallenge.count({
    where: { roomId: room.id },
  })

  if (count <= 0) {
    return NextResponse.json({ text: null })
  }

  const randomIndex = Math.floor(Math.random() * count)

  const item = await prisma.wheelTextChallenge.findFirst({
    where: { roomId: room.id },
    skip: randomIndex,
    orderBy: { createdAt: "desc" },
    select: { text: true },
  })

  if (!item) {
    return NextResponse.json({ text: null })
  }

  // Rotation "casino" : plusieurs tours + angle aléatoire.
  const spins = 6 + Math.floor(Math.random() * 4) // 6 à 9 tours
  const randomAngle = Math.floor(Math.random() * 360) // 0 à 359°
  const spinDegrees = spins * 360 + randomAngle

  return NextResponse.json({ text: item.text, spinDegrees })
}

