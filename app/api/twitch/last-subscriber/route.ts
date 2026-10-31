import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  ensureValidTwitchAccessToken,
  forceRefreshTwitchAccessToken,
} from "@/lib/twitch-token-refresh"

/**
 * Liste les abonnés Helix (scope `channel:read:subscriptions`).
 * Pas d’ordre chronologique garanti : on renvoie un snapshot (total + page)
 * pour que l’overlay détecte les nouveaux IDs entre deux polls.
 */
export async function GET(req: NextRequest) {
  const channelRaw = req.nextUrl.searchParams.get("channel")?.trim()
  const coopstreamKeyRaw = req.nextUrl.searchParams.get("coopstreamKey")?.trim()
  if (!channelRaw) {
    return NextResponse.json({ error: "channel requis" }, { status: 400 })
  }

  const clientId = process.env.TWITCH_CLIENT_ID
  const envToken = process.env.TWITCH_ACCESS_TOKEN

  let dbUserId: string | undefined

  try {
    const session = await auth.api.getSession({ headers: req.headers })
    const uid = session?.user?.id
    if (uid) dbUserId = uid
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

  if (!bearer && envToken) {
    bearer = envToken
  }

  if (!clientId || !bearer) {
    return NextResponse.json(
      {
        error: "config",
        message:
          "TWITCH_CLIENT_ID manquant ou token Twitch introuvable (connecte-toi Twitch ou passe une `coopstreamKey`).",
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
        next: { revalidate: 0 },
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

  if (!userRes.ok && userRes.status === 401 && envToken && envToken !== bearer) {
    bearer = envToken
    userRes = await helixUsers(bearer)
  }

  if (!userRes.ok) {
    return NextResponse.json(
      {
        error: "users",
        status: userRes.status,
        ...(userRes.status === 401
          ? {
              message:
                "Token Twitch refusé (401). Reconnecte Twitch (scope channel:read:subscriptions requis).",
            }
          : {}),
      },
      { status: 502 },
    )
  }

  const userJson = (await userRes.json()) as { data?: Array<{ id: string }> }
  const broadcasterId = userJson.data?.[0]?.id
  if (!broadcasterId) {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }

  const subRes = await fetch(
    `https://api.twitch.tv/helix/subscriptions?broadcaster_id=${encodeURIComponent(
      broadcasterId,
    )}&first=100`,
    {
      headers: {
        "Client-Id": clientId,
        Authorization: `Bearer ${bearer}`,
      },
      next: { revalidate: 0 },
    },
  )

  if (!subRes.ok) {
    return NextResponse.json(
      {
        error: "subscriptions",
        status: subRes.status,
        ...(subRes.status === 401 || subRes.status === 403
          ? {
              message:
                "Scope `channel:read:subscriptions` manquant ou compte non affiliate/partner. Reconnecte Twitch.",
            }
          : {}),
      },
      { status: 502 },
    )
  }

  const subJson = (await subRes.json()) as {
    data?: Array<{
      user_id: string
      user_login: string
      user_name: string
      tier?: string
      is_gift?: boolean
    }>
    total?: number
  }

  const subscribers = (subJson.data ?? []).map((s) => ({
    id: s.user_id,
    login: s.user_login,
    displayName: s.user_name,
    tier: s.tier ?? null,
    isGift: Boolean(s.is_gift),
  }))

  return NextResponse.json({
    subscribers,
    total: typeof subJson.total === "number" ? subJson.total : subscribers.length,
  })
}
