"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { StingerPreview } from "@/components/stinger/stinger-preview"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  STINGER_VARIANTS,
  type StingerVariantId,
  getStingerVariantMeta,
  isStingerVariantId,
} from "@/lib/stinger-variants"

export function StingerExportShell() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawV = searchParams.get("v")
  const initialVariant: StingerVariantId =
    rawV && isStingerVariantId(rawV) ? rawV : "diagonal"

  const [hideChrome, setHideChrome] = React.useState(false)
  const [replay, setReplay] = React.useState(0)
  const [variant, setVariant] = React.useState<StingerVariantId>(initialVariant)

  React.useEffect(() => {
    if (rawV && isStingerVariantId(rawV)) {
      setVariant((prev) => (prev === rawV ? prev : rawV))
    }
  }, [rawV])

  const meta = getStingerVariantMeta(variant)

  function setVariantAndUrl(next: StingerVariantId) {
    setVariant(next)
    const p = new URLSearchParams(searchParams.toString())
    p.set("v", next)
    router.replace(`/stinger?${p.toString()}`, { scroll: false })
    setReplay((n) => n + 1)
  }

  return (
    <div
      className={
        hideChrome
          ? "fixed inset-0 z-[100] flex flex-col bg-[#00ff00]"
          : "flex min-h-dvh flex-col bg-zinc-950 text-zinc-100"
      }
    >
      {!hideChrome ? (
        <header className="border-b border-white/10 px-4 py-3 sm:px-6">
          <div className="mx-auto flex max-w-4xl flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-lg font-semibold tracking-tight">Stinger OBS</h1>
                <p className="mt-1 text-sm text-zinc-400">
                  Scène 1920×1080, fond vert{" "}
                  <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-violet-200">
                    #00ff00
                  </code>{" "}
                  pour incrustation chromatique dans OBS.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
                  onClick={() => setReplay((n) => n + 1)}
                >
                  Rejouer
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10"
                  onClick={() => setHideChrome(true)}
                >
                  Mode capture
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:max-w-md">
              <label htmlFor="stinger-variant" className="text-xs font-medium text-zinc-500">
                Variante
              </label>
              <Select value={variant} onValueChange={(v) => setVariantAndUrl(v as StingerVariantId)}>
                <SelectTrigger
                  id="stinger-variant"
                  className="w-full border-white/15 bg-white/5 text-zinc-100 hover:bg-white/10"
                  size="default"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STINGER_VARIANTS.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs leading-relaxed text-zinc-500">{meta.description}</p>
              <p className="text-xs text-zinc-600">
                OBS — durée ~{meta.durationMs / 1000}s · point de transition ~{meta.transitionMs / 1000}s
              </p>
            </div>
          </div>
        </header>
      ) : (
        <div className="absolute left-2 top-2 z-[110] flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-md bg-black/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur hover:bg-black/90"
            onClick={() => setHideChrome(false)}
          >
            Afficher l’aide
          </button>
          <button
            type="button"
            className="rounded-md bg-black/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur hover:bg-black/90"
            onClick={() => setReplay((n) => n + 1)}
          >
            Rejouer
          </button>
        </div>
      )}

      <main className={hideChrome ? "flex flex-1 items-center justify-center" : "flex flex-1 flex-col"}>
        {!hideChrome ? (
          <div className="mx-auto w-full max-w-4xl px-4 py-4 text-sm text-zinc-400 sm:px-6">
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                Choisis une <strong className="text-zinc-200">variante</strong> ci-dessus (lien partageable :{" "}
                <code className="text-violet-200">?v={variant}</code>).
              </li>
              <li>
                Clique sur <strong className="text-zinc-200">Mode capture</strong> puis{" "}
                <kbd className="rounded bg-white/10 px-1">F11</kbd> si besoin — le pourtour est vert.
              </li>
              <li>
                Enregistre en <strong className="text-zinc-200">1920×1080</strong>, une lecture de
                l’animation.
              </li>
              <li>
                Transition Stinger : durée ~{meta.durationMs / 1000}s, point ~{meta.transitionMs / 1000}s,
                chrominance <code className="text-violet-200">#00ff00</code>, similarité ~100–250.
              </li>
              <li>
                WebM alpha : post-traitement (DaVinci / FFmpeg) — pas d’export alpha fiable depuis le
                navigateur.
              </li>
            </ol>
          </div>
        ) : null}

        <div
          className={
            hideChrome
              ? "flex flex-1 items-center justify-center"
              : "flex flex-1 items-center justify-center pb-8"
          }
        >
          <StingerPreview variant={variant} hideChrome={hideChrome} replayToken={replay} />
        </div>
      </main>
    </div>
  )
}
