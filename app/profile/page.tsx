"use client"

import * as React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import { useAuthSession } from "@/lib/useAuthSession"
import { authClient } from "@/lib/auth.client"
import { signInWithTwitch } from "@/lib/auth.client"

export default function ProfilePage() {
  const session = useAuthSession()
  const isAuthed = Boolean((session as any)?.user)

  const user = (session as any)?.user as
    | { name?: string; email?: string; image?: string }
    | undefined

  const displayName = user?.name ?? user?.email ?? "Twitch"
  const avatarUrl = user?.image ?? null
  const initial = displayName?.[0]?.toUpperCase?.() ?? "T"

  if (!isAuthed) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-4 px-6 py-10 text-center">
            <div className="text-xl font-semibold tracking-tight">Connexion requise</div>
            <div className="text-sm text-muted-foreground">
              Connecte-toi avec Twitch pour voir ton profil.
            </div>
            <Button size="sm" onClick={() => void signInWithTwitch()}>
              Se connecter Twitch
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight">Mon profil</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Informations de connexion (via Twitch).
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="bg-background/60">
          <CardContent className="flex flex-col gap-4 p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                {avatarUrl ? (
                  <AvatarImage
                    src={avatarUrl}
                    alt={displayName}
                    referrerPolicy="no-referrer"
                  />
                ) : null}
                <AvatarFallback className="bg-primary/10 text-primary">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{displayName}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {user?.email ?? "—"}
                </div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Source : Twitch (SSO)
            </div>

            <div className="mt-2">
              <Button
                variant="outline"
                onClick={() => void authClient.signOut()}
                className="gap-2"
              >
                Se déconnecter
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background/60">
          <CardContent className="p-6">
            <div className="text-sm font-semibold">À venir</div>
            <div className="mt-1 text-sm text-muted-foreground">
              On peut enrichir ce profil (rôles, préférences, etc.).
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}

