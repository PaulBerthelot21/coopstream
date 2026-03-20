import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HomeAdminCard } from "@/components/auth/home-admin-card";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8">
      <section className="grid gap-4 md:grid-cols-2">
        <Card className="bg-background/60">
          <CardHeader>
            <CardTitle>Overlay</CardTitle>
            <CardDescription>Ouvrir la vue OBS pour ajouter les overlays.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-end">
            <Button variant="outline" asChild>
              <Link href="/overlay">Ouvrir l'overlay</Link>
            </Button>
          </CardContent>
        </Card>

        <HomeAdminCard />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="bg-background/60 md:col-span-2">
          <CardHeader>
            <CardTitle>Skins</CardTitle>
            <CardDescription>Gérer et sélectionner les skins disponibles.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-end">
            <Button variant="outline" asChild>
              <Link href="/skins">Ouvrir les skins</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

