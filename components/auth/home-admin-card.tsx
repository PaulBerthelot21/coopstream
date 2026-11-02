"use client"

import * as React from "react"

import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { signInWithTwitch } from "@/lib/auth.client"
import { useAuthSession } from "@/lib/useAuthSession"

export function HomeAdminCard() {
  const session = useAuthSession()
  const isAuthed = Boolean((session as { user?: unknown } | null)?.user)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live</CardTitle>
        <CardDescription>Piloter les objectifs, la roue et les défis du live.</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-end">
        {isAuthed ? (
          <Button asChild>
            <Link href="/admin">Ouvrir le Live</Link>
          </Button>
        ) : (
          <Button variant="outline" onClick={() => void signInWithTwitch()}>
            Se connecter Twitch
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

