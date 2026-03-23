import Link from "next/link"
import { Target, Sparkles, Zap } from "lucide-react"

import { AdminProtected } from "@/components/auth/admin-protected"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default async function AdminPage() {
  return (
    <AdminProtected>
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8">
        <section className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
          <p className="text-sm text-muted-foreground">
            Choisis la section à configurer.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Card className="bg-background/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Défis (carrousel)
              </CardTitle>
              <CardDescription>Gère les challenges et la progression.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-end">
              <Button asChild size="sm" variant="secondary">
                <Link href="/admin/challenges">Ouvrir</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-background/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Objectif followers
              </CardTitle>
              <CardDescription>
                Définis un titre et un nombre à atteindre pour l’overlay “Objectif followers”.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-end">
              <Button asChild size="sm" variant="secondary">
                <Link href="/admin/follower-goal">Ouvrir</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-background/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Roue (défis texte)
              </CardTitle>
              <CardDescription>
                Configure les textes de la roue et teste l’animation en overlay.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-end">
              <Button asChild size="sm" variant="secondary">
                <Link href="/admin/wheel">Ouvrir</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-background/60 md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Streamdeck (défis)
              </CardTitle>
              <CardDescription>
                Mini liste rapide pour incrémenter les défis en live (boutons +1).
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-end">
              <Button asChild size="sm" variant="secondary">
                <Link href="/admin/streamdeck">Ouvrir</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
    </AdminProtected>
  )
}