import { createAuthClient } from "better-auth/client"
export const authClient = createAuthClient()

export async function signInWithTwitch(params?: { scopes?: string[] }) {
  return authClient.signIn.social({
    provider: "twitch",
    scopes:
      params?.scopes ??
      // On surcharge les scopes, donc on inclut aussi les scopes nécessaires à l'email.
      ["user:read:email", "openid", "moderator:read:followers"],
  })
}