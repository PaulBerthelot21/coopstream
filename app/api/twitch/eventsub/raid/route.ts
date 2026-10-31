import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  ensureValidTwitchAccessToken,
  forceRefreshTwitchAccessToken,
} from "@/lib/twitch-token-refresh"

/**
 * Crée une souscription EventSub `channel.raid` (transport websocket)
 * pour le broadcaster cible. Requiert un user token du broadcaster.
 */
export async function POST(req: NextRequest) {
  let body: { sessionId?: string; channel?: string; coopstreamKey?: string }
  try {
    body = (await req.json()) as typeof body
  } catch {
    return NextResponse.json({ error: "json invalide" }, { status: 400 })
  }

  const sessionId = body.sessionId?.trim()
  const channelRaw = body.channel?.trim()
  const coopstreamKeyRaw = body.coopstreamKey?.trim()

  if (!sessionId || !channelRaw) {
    return NextResponse.json(
      { error: "sessionId et channel requis" },
      { status: 400 },
    )
  }

  const clientId = process.env.TWITCH_CLIENT_ID
  const envToken = process.env.TWITCH_ACCESS_TOKEN

  let dbUserId: string | undefined
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (session?.user?.id) dbUserId = session.user.id
  } catch {
    // ignore
  }

  if (!dbUserId && coopstreamKeyRaw) {
    try {
      const room = await prisma.coopStreamRoom.findUnique({
        where: { key: coopstreamKeyRaw },
        select: { userId: true },
      })
      if (room?.userId) dbUserId = room.userId
    } catch {
      // ignore
    }
  }

  let bearer: string | undefined
  if (dbUserId) {
    bearer = (await ensureValidTwitchAccessToken(dbUserId)) ?? undefined
  }
  if (!bearer && envToken) bearer = envToken

  if (!clientId || !bearer) {
    return NextResponse.json(
      {
        error: "config",
        message:
          "Token Twitch introuvable (connecte-toi ou passe `coopstreamKey`).",
      },
      { status: 503 },
    )
  }

  const login = channelRaw.replace(/^#/, "").toLowerCase()

  const helixUsers = (token: string) =>
    fetch(
      `https://api.twitch.tv/helix/users?login=${encodeURIComponent(login)}`,
      {
        headers: {
          "Client-Id": clientId,
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    )

  let userRes = await helixUsers(bearer)
  if (!userRes.ok && userRes.status === 401 && dbUserId) {
    const refreshed = await forceRefreshTwitchAccessToken(dbUserId)
    if (refreshed && refreshed !== bearer) {
      bearer = refreshed
      userRes = await helixUsers(bearer)
    }
  }

  if (!userRes.ok) {
    return NextResponse.json(
      { error: "users", status: userRes.status },
      { status: 502 },
    )
  }

  const userJson = (await userRes.json()) as { data?: Array<{ id: string }> }
  const broadcasterId = userJson.data?.[0]?.id
  if (!broadcasterId) {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }

  const subRes = await fetch("https://api.twitch.tv/helix/eventsub/subscriptions", {
    method: "POST",
    headers: {
      "Client-Id": clientId,
      Authorization: `Bearer ${bearer}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "channel.raid",
      version: "1",
      condition: { to_broadcaster_user_id: broadcasterId },
      transport: { method: "websocket", session_id: sessionId },
    }),
    cache: "no-store",
  })

  if (!subRes.ok) {
    const errText = await subRes.text().catch(() => "")
    return NextResponse.json(
      {
        error: "eventsub",
        status: subRes.status,
        message: errText.slice(0, 400),
      },
      { status: 502 },
    )
  }

  const subJson = (await subRes.json()) as { data?: unknown }
  return NextResponse.json({ ok: true, data: subJson.data ?? null })
}
