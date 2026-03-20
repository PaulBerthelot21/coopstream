import { NextRequest, NextResponse } from "next/server"

/**
 * Nécessite un jeton utilisateur OAuth avec les droits Helix pour lire les followers
 * du canal cible (voir la doc Twitch « Get Channel Followers »).
 * Variables : TWITCH_CLIENT_ID, TWITCH_ACCESS_TOKEN
 */
export async function GET(req: NextRequest) {
  const channelRaw = req.nextUrl.searchParams.get("channel")?.trim()
  if (!channelRaw) {
    return NextResponse.json({ error: "channel requis" }, { status: 400 })
  }

  const clientId = process.env.TWITCH_CLIENT_ID
  const token = process.env.TWITCH_ACCESS_TOKEN

  if (!clientId || !token) {
    return NextResponse.json(
      { error: "config", message: "TWITCH_CLIENT_ID et TWITCH_ACCESS_TOKEN manquants" },
      { status: 503 },
    )
  }

  const login = channelRaw.replace(/^#/, "").toLowerCase()

  const userRes = await fetch(
    `https://api.twitch.tv/helix/users?login=${encodeURIComponent(login)}`,
    {
      headers: {
        "Client-Id": clientId,
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 0 },
    },
  )

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

  const folRes = await fetch(
    `https://api.twitch.tv/helix/channels/followers?broadcaster_id=${encodeURIComponent(
      broadcasterId,
    )}&first=1`,
    {
      headers: {
        "Client-Id": clientId,
        Authorization: `Bearer ${token}`,
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
