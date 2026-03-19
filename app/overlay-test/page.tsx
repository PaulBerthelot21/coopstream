"use client";

import Image from "next/image";

import { useBroadcastSync } from "@/lib/sync/useBroadcastSync";
import { useCoopStreamPersistence } from "@/lib/sync/useCoopStreamPersistence";
import { selectSelectedChallenge, useCoopStreamStore } from "@/lib/store/coopstream";

export default function OverlayTestPage() {
  useBroadcastSync();
  useCoopStreamPersistence();

  const selected = useCoopStreamStore(selectSelectedChallenge);

  if (!selected) {
    return (
      <div className="flex h-dvh w-dvw items-center justify-center bg-transparent">
        <div className="rounded-2xl border border-dashed border-border/60 bg-background/70 px-6 py-4 text-sm text-muted-foreground backdrop-blur-xl">
          Aucun défi sélectionné. Sélectionne un défi dans l&apos;admin pour
          prévisualiser le widget skin.
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh w-dvw items-center justify-center bg-transparent">
      <div className="flex max-w-xl flex-col gap-4 rounded-2xl bg-black/80 p-5 text-sm text-white ring-1 ring-white/10 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
              Défi lié à un skin
            </div>
            <div className="mt-1 line-clamp-2 text-base font-semibold">
              {selected.title}
            </div>
            {typeof selected.target === "number" && (
              <div className="mt-1 text-[11px] text-white/70">
                {selected.current ?? 0}/{selected.target} {selected.unit ?? ""}
              </div>
            )}
          </div>
        </div>

        {selected.skinImageUrl ? (
          <div className="relative h-40 w-full overflow-hidden rounded-xl ring-1 ring-white/10">
            <Image
              src={selected.skinImageUrl}
              alt={selected.title}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-white/20 text-xs text-white/60">
            Aucun skin lié. Ajoute une URL d&apos;image dans l&apos;admin pour ce défi.
          </div>
        )}
      </div>
    </div>
  );
}

