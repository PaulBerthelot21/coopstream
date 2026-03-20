import { NextRequest, NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type WheelItem = {
  id: string
  text: string
  createdAt: number
}

type WheelItemsEvent =
  | { type: "ADD"; payload: { text: string } }
  | { type: "DELETE"; payload: { id: string } }
  | { type: "UPDATE"; payload: { id: string; text: string } }

function generateWheelTextNormalized(input: string): string {
  return input.trim()
}

async function getUserIdFromSession(session: unknown): Promise<string | undefined> {
  const user = (session as any)?.user as
    | { id?: string; sub?: string; email?: string }
    | undefined

  const direct =
    user?.id?.toString().trim() ||
    user?.sub?.toString().trim() ||
    undefined

  if (direct) return direct

  const email = user?.email?.toString().trim()
  if (!email) return undefined

  const dbUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  })

  return dbUser?.id
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ key: string }> },
) {
  const params = await context.params
  const coopstreamKey = (params.key ?? "").trim()
  if (!coopstreamKey) {
    return jsonError("key requis", 400)
  }

  const room = await prisma.coopStreamRoom.findUnique({
    where: { key: coopstreamKey },
    select: { id: true },
  })

  if (!room) {
    return NextResponse.json({ items: [] as WheelItem[] })
  }

  const items = await prisma.wheelTextChallenge.findMany({
    where: { roomId: room.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, text: true, createdAt: true },
  })

  return NextResponse.json({
    items: items.map((i) => ({
      id: i.id,
      text: i.text,
      createdAt: i.createdAt.getTime(),
    })),
  })
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ key: string }> },
) {
  const params = await context.params
  const coopstreamKey = (params.key ?? "").trim()
  if (!coopstreamKey) {
    return jsonError("key requis", 400)
  }

  let body: unknown = null
  try {
    body = await req.json()
  } catch {
    return jsonError("body invalide", 400)
  }

  const event = body as Partial<WheelItemsEvent>
  const type = typeof event.type === "string" ? event.type : null
  const payload = (event as any).payload ?? {}

  if (!type || (type !== "ADD" && type !== "DELETE" && type !== "UPDATE")) {
    return jsonError("type d'event invalide", 400)
  }

  try {
    const session = await auth.api.getSession({ headers: req.headers })
    const userId = await getUserIdFromSession(session)

    if (!userId) {
      return jsonError("auth requis", 401)
    }

    const existingRoom = await prisma.coopStreamRoom.findUnique({
      where: { key: coopstreamKey },
      select: { id: true, userId: true },
    })

    if (!existingRoom) {
      return jsonError("room introuvable", 404)
    }

    if (existingRoom.userId && existingRoom.userId !== userId) {
      return jsonError("room inaccessible", 403)
    }

    if (!existingRoom.userId) {
      await prisma.coopStreamRoom.update({
        where: { id: existingRoom.id },
        data: { userId },
      })
    }

    switch (type) {
      case "ADD": {
        const rawText =
          typeof payload?.text === "string" ? payload.text : ""
        const text = generateWheelTextNormalized(rawText)
        if (!text) return jsonError("text requis", 400)

        await prisma.wheelTextChallenge.create({
          data: { roomId: existingRoom.id, text },
        })

        return NextResponse.json({ ok: true })
      }

      case "DELETE": {
        const id = typeof payload?.id === "string" ? payload.id : ""
        if (!id) return jsonError("id requis", 400)

        await prisma.wheelTextChallenge.deleteMany({
          where: { roomId: existingRoom.id, id },
        })

        return NextResponse.json({ ok: true })
      }

      case "UPDATE": {
        const id = typeof payload?.id === "string" ? payload.id : ""
        const rawText =
          typeof payload?.text === "string" ? payload.text : ""
        const text = generateWheelTextNormalized(rawText)

        if (!id) return jsonError("id requis", 400)
        if (!text) return jsonError("text requis", 400)

        await prisma.wheelTextChallenge.updateMany({
          where: { roomId: existingRoom.id, id },
          data: { text },
        })

        return NextResponse.json({ ok: true })
      }
    }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erreur inconnue côté serveur"
    console.error("wheel-items POST failed:", message)
    return NextResponse.json(
      { error: "DB indisponible", message },
      { status: 503 },
    )
  }

  return jsonError("event non géré", 400)
}

