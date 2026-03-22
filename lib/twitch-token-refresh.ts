import { prisma } from "@/lib/prisma"

type TwitchRefreshResponse = {
  access_token: string
  expires_in: number
  refresh_token?: string
  scope?: string
  token_type: string
}

/**
 * Échange un refresh_token Twitch contre un nouvel access_token.
 * @see https://dev.twitch.tv/docs/authentication/refresh-tokens/
 */
export async function exchangeTwitchRefreshToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string,
): Promise<TwitchRefreshResponse | null> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
  })

  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  })

  if (!res.ok) {
    return null
  }

  try {
    return (await res.json()) as TwitchRefreshResponse
  } catch {
    return null
  }
}

const EXPIRY_BUFFER_MS = 5 * 60 * 1000 // 5 min avant expiration

async function persistRefreshedTokens(
  accountId: string,
  json: TwitchRefreshResponse,
) {
  await prisma.account.update({
    where: { id: accountId },
    data: {
      accessToken: json.access_token,
      ...(json.refresh_token ? { refreshToken: json.refresh_token } : {}),
      accessTokenExpiresAt: new Date(Date.now() + json.expires_in * 1000),
    },
  })
}

/**
 * Retourne un access_token utilisable : refresh proactif si proche de l'expiration.
 */
export async function ensureValidTwitchAccessToken(
  userId: string,
): Promise<string | null> {
  const clientId = process.env.TWITCH_CLIENT_ID
  const clientSecret = process.env.TWITCH_CLIENT_SECRET

  const account = await prisma.account.findFirst({
    where: { userId, providerId: "twitch" },
    select: {
      id: true,
      accessToken: true,
      refreshToken: true,
      accessTokenExpiresAt: true,
    },
  })

  if (!account?.accessToken) return null

  const exp = account.accessTokenExpiresAt?.getTime()
  const stillFresh =
    typeof exp === "number" && exp > Date.now() + EXPIRY_BUFFER_MS

  if (stillFresh) {
    return account.accessToken
  }

  if (account.refreshToken && clientId && clientSecret) {
    const json = await exchangeTwitchRefreshToken(
      account.refreshToken,
      clientId,
      clientSecret,
    )
    if (json?.access_token) {
      await persistRefreshedTokens(account.id, json)
      return json.access_token
    }
  }

  // Pas d'expiry connue ou refresh impossible : on tente quand même l'access actuel
  return account.accessToken
}

/**
 * Force un refresh (ex. après 401 Helix) même si l'expiration n'était pas stockée.
 */
export async function forceRefreshTwitchAccessToken(
  userId: string,
): Promise<string | null> {
  const clientId = process.env.TWITCH_CLIENT_ID
  const clientSecret = process.env.TWITCH_CLIENT_SECRET
  if (!clientId || !clientSecret) return null

  const account = await prisma.account.findFirst({
    where: { userId, providerId: "twitch" },
    select: { id: true, refreshToken: true },
  })

  if (!account?.refreshToken) return null

  const json = await exchangeTwitchRefreshToken(
    account.refreshToken,
    clientId,
    clientSecret,
  )
  if (!json?.access_token) return null

  await persistRefreshedTokens(account.id, json)
  return json.access_token
}
