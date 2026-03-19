"use client";

import { usePrimaryColor } from "@/components/primary-color-provider";
import { useOverlaySettings } from "@/components/overlay/overlay-settings-provider";
import { Button } from "@/components/ui/button";

const overlayModeLabels: Record<
  ReturnType<typeof useOverlaySettings>["settings"]["mode"],
  string
> = {
  bar: "Barre",
  ticker: "Ticker",
  "now-playing": "Now playing",
  scoreboard: "Scoreboard",
  carousel: "Carrousel",
};

export default function SettingsPage() {
  const { primaryColor, setPrimaryColor, resetPrimaryColor } = usePrimaryColor();
  const { settings, setMode } = useOverlaySettings();

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
        <h2 className="text-sm font-semibold tracking-tight">
          Mode d&apos;overlay par défaut
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Le mode sélectionné sera utilisé par défaut sur l&apos;overlay. Tu peux
          toujours le changer en live via le sélecteur.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(overlayModeLabels).map(([value, label]) => (
            <Button
              key={value}
              type="button"
              variant={settings.mode === value ? "secondary" : "outline"}
              size="sm"
              onClick={() => setMode(value as typeof settings.mode)}
            >
              {label}
            </Button>
          ))}
        </div>
      </section>
    </main>
  );
}

