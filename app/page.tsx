import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8">
      <section>
        <h1 className="text-3xl font-semibold tracking-tight">CoopStream</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Outil local-first pour gérer tes challenges de stream en temps réel.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Admin</CardTitle>
            <CardDescription>Créer, choisir et déclencher les rewards.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-end">
            <Button asChild>
              <Link href="/admin">Ouvrir l&apos;admin</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Overlay</CardTitle>
            <CardDescription>Vue OBS pour afficher le challenge en cours.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-end">
            <Button variant="outline" asChild>
              <Link href="/overlay">Ouvrir l&apos;overlay</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

