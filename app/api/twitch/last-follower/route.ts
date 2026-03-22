import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  ensureValidTwitchAccessToken,
  forceRefreshTwitchAccessToken,
} from "@/lib/twitch-token-refresh"

/**
 * Nécessite un jeton utilisateur OAuth avec les droits Helix pour lire les followers
 * du canal cible (voir la doc Twitch « Get Channel Followers »).
 * Le access_token Twitch est rafraîchi automatiquement via refresh_token quand il expire.
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

  // 401 : refresh forcé (refresh_token) puis retry
  if (!userRes.ok && userRes.status === 401 && dbUserId) {
    const refreshed = await forceRefreshTwitchAccessToken(dbUserId)
    if (refreshed && refreshed !== bearer) {
      bearer = refreshed
      userRes = await helixUsers(bearer)
    }
  }

  // Dernier recours : token env si différent
  if (
    !userRes.ok &&
    userRes.status === 401 &&
    envToken &&
    envToken !== bearer
  ) {
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
                "Token Twitch refusé (401). Vérifie TWITCH_CLIENT_SECRET sur Vercel (requis pour le refresh), ou reconnecte Twitch si le refresh_token est révoqué.",
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

  const folRes = await fetch(
    `https://api.twitch.tv/helix/channels/followers?broadcaster_id=${encodeURIComponent(
      broadcasterId,
    )}&first=1`,
    {
      headers: {
        "Client-Id": clientId,
        Authorization: `Bearer ${bearer}`,
      },
      next: { revalidate: 0 },
    },
  )

  if (!folRes.ok) {
    return NextResponse.json(
      { error: "followers", status: folRes.status },
      { status: 502 },
    )
  }

  const folJson = (await folRes.json()) as {
    data?: Array<{
      user_login: string
      user_name: string
      followed_at: string
    }>
    total?: number
  }

  const first = folJson.data?.[0]
  if (!first) {
    return NextResponse.json({
      follower: null,
      total: folJson.total ?? 0,
    })
  }

  return NextResponse.json({
    follower: {
      login: first.user_login,
      displayName: first.user_name,
      followedAt: first.followed_at,
    },
    total: folJson.total,
  })
}
