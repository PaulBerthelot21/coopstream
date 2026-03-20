import { NextRequest, NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function generateCoopstreamKey(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
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

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    const userId = await getUserIdFromSession(session)

    if (!userId) {
      return NextResponse.json({ error: "auth requis" }, { status: 401 })
    }

    const existing = await prisma.coopStreamRoom.findFirst({
      where: { userId },
      select: { key: true },
    })

    if (existing?.key) {
      return NextResponse.json({ coopstreamKey: existing.key })
    }

    // Créer une room "défis" stable pour cet utilisateur.
    // On boucle très rarement en cas de collision sur le champ `key`.
    for (let attempt = 0; attempt < 5; attempt++) {
      const coopstreamKey = generateCoopstreamKey()
      const created = await prisma.coopStreamRoom.create({
        data: { key: coopstreamKey, userId },
        select: { key: true },
      })
      if (created?.key) {
        return NextResponse.json({ coopstreamKey: created.key })
      }
    }

    return NextResponse.json(
      { error: "impossible de générer une coopstreamKey" },
      { status: 500 },
    )
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erreur inconnue côté serveur"
    console.error("GET /api/coopstream/rooms/me failed:", message)
    return NextResponse.json(
      { error: "DB indisponible", message },
      { status: 503 },
    )
  }
}

