import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  ensureValidTwitchAccessToken,
  forceRefreshTwitchAccessToken,
} from "@/lib/twitch-token-refresh"

/**
 * Récupère le planning Twitch (Helix Get Channel Stream Schedule).
 * Token user via session / coopstreamKey, ou TWITCH_ACCESS_TOKEN en secours.
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
    fetch(`https://api.twitch.tv/helix/users?login=${encodeURIComponent(login)}`, {
      headers: {
        "Client-Id": clientId,
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 0 },
    })

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
      { error: "user", status: userRes.status },
      { status: 502 },
    )
  }

  const userJson = (await userRes.json()) as {
    data?: Array<{ id: string; login: string; display_name: string }>
  }
  const user = userJson.data?.[0]
  if (!user?.id) {
    return NextResponse.json({ error: "channel_not_found" }, { status: 404 })
  }

  const start = new Date().toISOString()
  const schedRes = await fetch(
    `https://api.twitch.tv/helix/schedule?broadcaster_id=${encodeURIComponent(user.id)}&start_time=${encodeURIComponent(start)}&first=7`,
    {
      headers: {
        "Client-Id": clientId,
        Authorization: `Bearer ${bearer}`,
      },
      next: { revalidate: 0 },
    },
  )

  // Pas de planning configuré
  if (schedRes.status === 404) {
    return NextResponse.json({
      broadcaster: { login: user.login, displayName: user.display_name },
      segments: [],
      empty: true,
    })
  }

  if (!schedRes.ok) {
    return NextResponse.json(
      { error: "schedule", status: schedRes.status },
      { status: 502 },
    )
  }

  const schedJson = (await schedRes.json()) as {
    data?: {
      segments?: Array<{
        id: string
        start_time: string
        end_time: string
        title: string
        canceled_until: string | null
        category?: { id: string; name: string } | null
        is_recurring: boolean
      }>
      vacation?: unknown
    }
  }

  const segments = (schedJson.data?.segments ?? [])
    .filter((s) => !s.canceled_until)
    .map((s) => ({
      id: s.id,
      title: s.title?.trim() || "Stream",
      startTime: s.start_time,
      endTime: s.end_time,
      category: s.category?.name ?? null,
      isRecurring: s.is_recurring,
    }))

  return NextResponse.json({
    broadcaster: { login: user.login, displayName: user.display_name },
    segments,
    empty: segments.length === 0,
  })
}
