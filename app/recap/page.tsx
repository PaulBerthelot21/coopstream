"use client";

import * as React from "react";

import { selectSelectedChallenge, useCoopStreamStore } from "@/lib/store/coopstream";

export default function RecapPage() {
  const challengesMap = useCoopStreamStore((s) => s.challenges);
  const selected = useCoopStreamStore(selectSelectedChallenge);

  const challenges = React.useMemo(
    () =>
      Object.values(challengesMap).sort(
        (a, b) => b.updatedAt - a.updatedAt,
      ),
    [challengesMap],
  );

  type Bucket = "not-started" | "in-progress" | "completed";

  const buckets = React.useMemo(() => {
    const grouped: Record<Bucket, typeof challenges> = {
      "not-started": [],
      "in-progress": [],
      completed: [],
    };
    for (const c of challenges) {
      if (typeof c.target === "number") {
        const current = c.current ?? 0;
        if (current >= c.target) {
          grouped.completed.push(c);
        } else if (current > 0) {
          grouped["in-progress"].push(c);
        } else {
          grouped["not-started"].push(c);
        }
      } else {
        // Pas d'objectif numérique: considérer comme "en cours" si current>0
        const current = c.current ?? 0;
        if (current > 0) grouped["in-progress"].push(c);
        else grouped["not-started"].push(c);
      }
    }
    return grouped;
  }, [challenges]);

  const sections: { key: Bucket; title: string; description: string }[] = [
    {
      key: "in-progress",
      title: "En cours",
      description: "Défis sur lesquels tu as déjà commencé à progresser.",
    },
    {
      key: "completed",
      title: "Terminés",
      description: "Défis complétés pendant la session.",
    },
    {
      key: "not-started",
      title: "À venir",
      description: "Défis créés mais pas encore entamés.",
    },
  ];

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-7">
      <section className="space-y-1">
        <h1 className="text-[22px] font-semibold tracking-tight">
          Récap des défis
        </h1>
        <p className="text-sm text-muted-foreground">
          Vue synthétique de tous les défis de la session, avec leur état et leur progression.
        </p>
      </section>

      {sections.map((section) => {
        const list = buckets[section.key];
        if (list.length === 0) return null;

        return (
          <section key={section.key} className="space-y-3">
            <div className="flex items-baseline justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold tracking-tight">
                  {section.title}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {section.description}
                </p>
              </div>
              <span className="text-[11px] text-muted-foreground">
                {list.length} défi{list.length > 1 ? "s" : ""}
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {list.map((c) => {
                const ratio =
                  typeof c.target === "number" && c.target > 0
                    ? Math.min(1, (c.current ?? 0) / c.target)
                    : null;
                const isSelected = selected?.id === c.id;
                return (
                  <div
                    key={c.id}
                    className={[
                      "flex flex-col gap-2 rounded-2xl border border-border/60 bg-card/80 p-4 text-sm shadow-sm backdrop-blur-xl",
                      isSelected ? "ring-2 ring-primary/60" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">
                          {c.title}
                        </div>
                        {c.reward && (
                          <div className="truncate text-xs text-muted-foreground">
                            Reward: {c.reward}
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                          Actuel
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
                      <div>
                        {typeof c.target === "number" ? (
                          <span>
                            {c.current ?? 0}/{c.target} {c.unit ?? ""}
                          </span>
                        ) : (
                          <span>Progression: {c.current ?? 0}</span>
                        )}
                      </div>
                      <span>
                        Dernière maj:{" "}
                        {new Date(c.updatedAt).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {ratio != null && (
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-lime-300"
                          style={{ width: `${(ratio * 100).toFixed(0)}%` }}
                        />
                      </div>
                    )}

                    {c.skinImageUrl && (
                      <div className="mt-1 flex items-center gap-2">
                        <div className="relative h-10 w-20 overflow-hidden rounded-md bg-black/40 ring-1 ring-border/60">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={c.skinImageUrl}
                            alt={c.title}
                            className="h-full w-full object-contain"
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          Skin lié à ce défi.
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </main>
  );
}

