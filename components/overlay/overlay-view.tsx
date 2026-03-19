"use client"

import * as React from "react"
import Link from "next/link"

export function OverlayView() {
  return (
    <div className="min-h-[360px] w-full bg-transparent flex items-center justify-center">
      <div className="w-full max-w-5xl px-4">
        <div className="rounded-2xl border border-border/60 bg-background/60 p-6 shadow-sm backdrop-blur-xl">
          <h1 className="text-xl font-semibold tracking-tight">Overlay</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Choisis quelle source tu veux ajouter dans OBS.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/overlay-chat"
              className="inline-flex items-center justify-center rounded-full bg-black/60 px-4 py-2 text-sm text-white ring-1 ring-white/20 transition hover:bg-black/70"
            >
              Chat Twitch
            </Link>

            <Link
              href="/overlay-defi-carrousel"
              className="inline-flex items-center justify-center rounded-full bg-black/60 px-4 py-2 text-sm text-white ring-1 ring-white/20 transition hover:bg-black/70"
            >
              Défis / Carrousel
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

