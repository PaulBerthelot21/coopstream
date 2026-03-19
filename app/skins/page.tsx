"use client";

import * as React from "react";
import Image from "next/image";
import { Copy } from "lucide-react";

type Cs2Skin = {
  id: string;
  name: string;
  weapon: {
    name: string;
  };
  wear?: {
    name: string;
  };
  image: string;
};

const DATA_URL =
  "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins_not_grouped.json";
const MAX_ROWS = 200;

export default function SkinsPage() {
  const [skins, setSkins] = React.useState<Cs2Skin[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [weaponFilter, setWeaponFilter] = React.useState<string>("all");
  const [wearFilter, setWearFilter] = React.useState<string>("all");

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(DATA_URL);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const json = (await res.json()) as any[];
        if (!cancelled) {
          const mapped: Cs2Skin[] = json.map((item) => ({
            id: item.id,
            name: item.name,
            weapon: { name: item.weapon?.name ?? "Unknown" },
            wear: item.wear ? { name: item.wear.name } : undefined,
            image: item.image,
          }));
          setSkins(mapped);
        }
      } catch (e) {
        if (!cancelled) {
          setError("Impossible de charger les skins CS2.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const weaponOptions = React.useMemo(() => {
    const set = new Set<string>();
    skins.forEach((s) => {
      if (s.weapon.name) set.add(s.weapon.name);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [skins]);

  const wearOptions = React.useMemo(() => {
    const set = new Set<string>();
    skins.forEach((s) => {
      if (s.wear?.name) set.add(s.wear.name);
    });
    const preferred = [
      "Factory New",
      "Minimal Wear",
      "Field-Tested",
      "Well-Worn",
      "Battle-Scarred",
    ];
    const rest = Array.from(set).filter((w) => !preferred.includes(w));
    return [...preferred.filter((w) => set.has(w)), ...rest.sort()];
  }, [skins]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const out: Cs2Skin[] = [];
    for (const s of skins) {
      if (weaponFilter !== "all" && s.weapon.name !== weaponFilter) continue;
      if (wearFilter !== "all" && s.wear?.name !== wearFilter) continue;

      if (q) {
        const lowerName = s.name.toLowerCase();
        const lowerWeapon = s.weapon.name.toLowerCase();
        const lowerId = s.id.toLowerCase();
        if (
          !(
            lowerName.includes(q) ||
            lowerWeapon.includes(q) ||
            lowerId.includes(q)
          )
        ) {
          continue;
        }
      }

      out.push(s);
      if (out.length >= MAX_ROWS) break;
    }
    return out;
  }, [skins, query, weaponFilter, wearFilter]);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-7">
      <section className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">
          Skins CS2 (API ByMykel)
        </h1>
        <p className="text-sm text-muted-foreground">
          Aperçu des skins récupérés depuis l&apos;API JSON non officielle CS2
          (id, nom, arme, image).
        </p>
      </section>

      <section className="flex flex-wrap items-center gap-3">
        <div className="flex min-w-[180px] flex-1 gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par nom, arme ou id..."
            className="h-8 w-full rounded-lg border border-input bg-background px-2 text-sm"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <label className="flex items-center gap-1">
            <span>Arme</span>
            <select
              value={weaponFilter}
              onChange={(e) => setWeaponFilter(e.target.value)}
              className="h-7 rounded border border-input bg-background px-2 text-xs"
            >
              <option value="all">Toutes</option>
              {weaponOptions.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-1">
            <span>Qualité</span>
            <select
              value={wearFilter}
              onChange={(e) => setWearFilter(e.target.value)}
              className="h-7 rounded border border-input bg-background px-2 text-xs"
            >
              <option value="all">Toutes</option>
              {wearOptions.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </label>
        </div>
        <span className="ml-auto text-xs text-muted-foreground whitespace-nowrap">
          {filtered.length} / {skins.length || "…"} skins (max {MAX_ROWS} affichés)
        </span>
      </section>

      {loading && (
        <div className="text-sm text-muted-foreground">Chargement des skins…</div>
      )}
      {error && (
        <div className="text-sm text-destructive">
          {error} Vérifie ta connexion ou réessaie plus tard.
        </div>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto rounded-xl border border-border/60 bg-background/60">
          <table className="min-w-full text-left text-xs">
            <thead className="border-b border-border/60 bg-muted/60 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Image</th>
                <th className="px-3 py-2">Nom</th>
                <th className="px-3 py-2">Arme</th>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((skin) => (
                <tr
                  key={skin.id}
                  className="border-b border-border/40 last:border-0 hover:bg-muted/40"
                >
                  <td className="px-3 py-1.5">
                    <div className="relative h-10 w-24 overflow-hidden rounded bg-black/40">
                      {skin.image ? (
                        <Image
                          src={skin.image}
                          alt={skin.name}
                          fill
                          className="object-contain"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                          N/A
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-1.5 text-sm text-foreground">
                    <div className="max-w-[260px] truncate">{skin.name}</div>
                  </td>
                  <td className="px-3 py-1.5 text-xs text-muted-foreground">
                    {skin.weapon.name}
                  </td>
                  <td className="px-3 py-1.5 text-[10px] text-muted-foreground">
                    <div className="max-w-[220px] truncate">{skin.id}</div>
                  </td>
                  <td className="px-3 py-1.5 text-right">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(skin.image);
                          setCopiedId(skin.id);
                          window.setTimeout(() => {
                            setCopiedId((prev) => (prev === skin.id ? null : prev));
                          }, 1500);
                        } catch {
                          // ignore
                        }
                      }}
                      className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/60 px-2 py-0.5 text-[10px] text-muted-foreground hover:border-border hover:text-foreground"
                    >
                      <Copy className="h-3 w-3" />
                      <span>
                        {copiedId === skin.id ? "Copié" : "Copier"}
                      </span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

