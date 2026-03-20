"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { signInWithTwitch } from "@/lib/auth.client"
import { useAuthSession } from "@/lib/useAuthSession"

export function AdminProtected({ children }: { children: React.ReactNode }) {
  const session = useAuthSession()
  const isAuthed = Boolean((session as any)?.user)

  if (!isAuthed) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center gap-4 px-6 py-10 text-center">
        <h1 className="text-xl font-semibold tracking-tight">Connexion requise</h1>
        <p className="text-sm text-muted-foreground">
          Connecte-toi avec Twitch pour accéder à l’admin.
        </p>
        <Button size="sm" onClick={() => void signInWithTwitch()}>
          Se connecter Twitch
        </Button>
      </div>
    )
  }

  return <>{children}</>
}

