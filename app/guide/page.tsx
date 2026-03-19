"use client";

export default function GuidePage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8">
      <section className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Guide rapide CoopStream
        </h1>
        <p className="text-sm text-muted-foreground">
          Comment utiliser l&apos;admin, l&apos;overlay et les skins pendant ton
          stream.
        </p>
      </section>

      <section className="space-y-2 rounded-2xl border border-border/60 bg-background/60 p-4 shadow-sm">
        <h2 className="text-sm font-semibold tracking-tight">1. Lancer l&apos;app</h2>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
          <li>
            Démarre le serveur de dev :{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              npm run dev
            </code>
          </li>
          <li>
            Ouvre l&apos;admin :{" "}
            <span className="font-mono text-xs text-foreground">
              http://localhost:3000/admin
            </span>
          </li>
          <li>
            Ouvre l&apos;overlay :{" "}
            <span className="font-mono text-xs text-foreground">
              http://localhost:3000/overlay
            </span>
          </li>
        </ol>
      </section>

      <section className="space-y-2 rounded-2xl border border-border/60 bg-background/60 p-4 shadow-sm">
        <h2 className="text-sm font-semibold tracking-tight">
          2. Ajouter CoopStream dans OBS
        </h2>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Dans OBS, ajoute une nouvelle source &quot;Browser&quot;.</li>
          <li>
            URL :{" "}
            <span className="font-mono text-xs text-foreground">
              http://localhost:3000/overlay
            </span>
          </li>
          <li>Résolution : 1920x1080 (ou celle de ta scène).</li>
          <li>
            Place l&apos;overlay sous ta caméra (les designs Barre / Now playing /
            Scoreboard sont pensés pour ça).
          </li>
        </ol>
      </section>

      <section className="space-y-2 rounded-2xl border border-border/60 bg-background/60 p-4 shadow-sm">
        <h2 className="text-sm font-semibold tracking-tight">
          3. Gérer les défis en live
        </h2>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>
            <span className="font-medium text-foreground">Créer un défi :</span>{" "}
            remplis le titre, l&apos;objectif (ex: 15 kills) et la reward, puis clique
            sur &quot;Créer le défi&quot;.
          </li>
          <li>
            <span className="font-medium text-foreground">
              Sélectionner / Déselectionner :
            </span>{" "}
            utilise le bouton sur chaque carte pour choisir le défi courant.
          </li>
          <li>
            <span className="font-medium text-foreground">
              Mettre à jour la progression :
            </span>{" "}
            les boutons + et − incrémentent / décrémentent la valeur, et
            l&apos;overlay se met à jour automatiquement.
          </li>
          <li>
            <span className="font-medium text-foreground">
              Export / import JSON :
            </span>{" "}
            en haut à droite de l&apos;admin, pour sauvegarder / recharger ta liste
            de défis.
          </li>
        </ul>
      </section>

      <section className="space-y-2 rounded-2xl border border-border/60 bg-background/60 p-4 shadow-sm">
        <h2 className="text-sm font-semibold tracking-tight">
          4. Skins CS2 et images
        </h2>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>
            Va sur la page{" "}
            <span className="font-mono text-xs text-foreground">/skins</span>{" "}
            pour parcourir les skins CS2 (via l&apos;API publique ByMykel).
          </li>
          <li>
            Utilise les filtres (arme, qualité) et le bouton &quot;Copier&quot; pour
            récupérer l&apos;URL d&apos;une image de skin.
          </li>
          <li>
            Colle cette URL dans le champ &quot;URL image skin&quot; d&apos;un défi dans
            l&apos;admin pour lier visuellement ce skin à ton challenge.
          </li>
          <li>
            Les overlays &quot;Now playing&quot;, &quot;Scoreboard&quot; et &quot;Carrousel&quot;
            affichent automatiquement l&apos;image si présente.
          </li>
        </ul>
      </section>

      <section className="space-y-2 rounded-2xl border border-border/60 bg-background/60 p-4 shadow-sm">
        <h2 className="text-sm font-semibold tracking-tight">
          5. Personnalisation visuelle
        </h2>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>
            Dans{" "}
            <span className="font-mono text-xs text-foreground">/settings</span>,
            choisis:
          </li>
          <li className="pl-4">
            – la **couleur primaire** de ton thème (appliquée partout),
          </li>
          <li className="pl-4">
            – le **mode d&apos;overlay par défaut** (Barre, Ticker, Now playing,
            Scoreboard, Carrousel).
          </li>
        </ul>
      </section>
    </main>
  );
}

