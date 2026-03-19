"use client";

import * as React from "react";
import { usePrimaryColor } from "@/components/primary-color-provider";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Moon, SunMedium } from "lucide-react";

export default function SettingsPage() {
  const { primaryColor, setPrimaryColor, resetPrimaryColor } = usePrimaryColor();
  const { theme, setTheme } = useTheme();
  const STORAGE_KEY = "coopstream-twitch-channel";
  const [twitchChannel, setTwitchChannel] = React.useState<string>("");

  function normalize(input: string) {
    return input
      .trim()
      .replace(/^@/, "")
      .replace(/^https?:\/\/(www\.)?twitch\.tv\//i, "")
      .split("/")[0]
      .toLowerCase();
  }

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setTwitchChannel(normalize(raw));
    } catch {
      // ignore
    }
  }, []);

  function saveTwitchChannel() {
    try {
      const normalized = normalize(twitchChannel);
      window.localStorage.setItem(STORAGE_KEY, normalized);
    } catch {
      // ignore
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight">Paramètres</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Personnalise l&apos;apparence de CoopStream pour ton stream.
        </p>
      </section>

      <section className="rounded-2xl border border-border/60 bg-background/60 p-4 shadow-sm">
        <h2 className="text-sm font-semibold tracking-tight">
          Couleur primaire
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Utilisée pour les éléments mis en avant de l&apos;interface (boutons,
          accents, overlays).
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">Choisir une couleur :</span>
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="h-8 w-10 cursor-pointer rounded border border-border bg-transparent p-0"
            />
          </label>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Hex :</span>
            <input
              type="text"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="h-7 w-28 rounded border border-input bg-background px-2 text-xs"
            />
          </div>
          <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            <span>Aperçu :</span>
            <div
              className="h-6 w-16 rounded-full ring-1 ring-border"
              style={{ backgroundColor: primaryColor }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={resetPrimaryColor}>
              Réinitialiser
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border/60 bg-background/60 p-4 shadow-sm">
        <h2 className="text-sm font-semibold tracking-tight">Chat Twitch</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Définit le canal Twitch utilisé par l&apos;overlay chat.
        </p>

        <div className="mt-4 flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground">Nom du canal</span>
            <input
              type="text"
              value={twitchChannel}
              onChange={(e) => setTwitchChannel(e.target.value)}
              placeholder="@anthemtv_ (ou juste anthemtv_)"
              className="h-9 w-full rounded border border-input bg-background px-3 text-sm"
            />
          </label>

          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">
              Astuce : tu peux aussi passer{" "}
              <span className="font-mono">?channel=...</span> dans l&apos;URL.
            </span>
            <Button type="button" variant="outline" onClick={saveTwitchChannel}>
              Sauvegarder
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border/60 bg-background/60 p-4 shadow-sm">
        <h2 className="text-sm font-semibold tracking-tight">Thème</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Choisis ton thème pour l&apos;interface (les overlays restent transparents
          et lisibles).
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            variant={theme === "light" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setTheme("light")}
            className="gap-1.5"
          >
            <SunMedium className="h-3.5 w-3.5" />
            Clair
          </Button>

          <Button
            type="button"
            variant={theme === "dark" || !theme ? "secondary" : "outline"}
            size="sm"
            onClick={() => setTheme("dark")}
            className="gap-1.5"
          >
            <Moon className="h-3.5 w-3.5" />
            Sombre
          </Button>
        </div>
      </section>
    </main>
  );
}

