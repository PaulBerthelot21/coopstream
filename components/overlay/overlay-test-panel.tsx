"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  OVERLAY_PRESET_OPTIONS,
  OVERLAY_PRESET_STORAGE_KEY,
  parseOverlayPreset,
  type OverlayPreset,
} from "@/lib/overlay/presets"
import {
  createOverlayTestEvent,
  OVERLAY_TEST_KINDS,
  publishOverlayTestEvent,
  type OverlayTestKind,
} from "@/lib/overlay/test-events"

const COOPSTREAM_KEY_STORAGE = "coopstream-last-coopstreamKey"

const PREVIEW_HREFS: Record<OverlayTestKind, string> = {
  follow: "/overlay-new-follower",
  sub: "/overlay-new-sub",
  raid: "/overlay-new-raid",
}

export function OverlayTestPanel() {
  const [displayName, setDisplayName] = React.useState("BryanTest")
  const [coopstreamKey, setCoopstreamKey] = React.useState("")
  const [preset, setPreset] = React.useState<OverlayPreset>("lecalme-rebrand")
  const [busy, setBusy] = React.useState<OverlayTestKind | null>(null)
  const [origin, setOrigin] = React.useState("")

  React.useEffect(() => {
    try {
      setOrigin(window.location.origin)
      setCoopstreamKey(window.localStorage.getItem(COOPSTREAM_KEY_STORAGE) ?? "")
      setPreset(
        parseOverlayPreset(
          window.localStorage.getItem(OVERLAY_PRESET_STORAGE_KEY) ?? undefined,
        ),
      )
    } catch {
      // ignore
    }
  }, [])

  const fire = React.useCallback(
    async (kind: OverlayTestKind) => {
      const event = createOverlayTestEvent(kind, displayName)
      publishOverlayTestEvent(event)

      setBusy(kind)
      try {
        const scopeKey = coopstreamKey.trim() || "global"
        const res = await fetch("/api/overlay/test", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kind,
            displayName: event.displayName,
            scopeKey,
          }),
        })
        if (!res.ok) {
          toast.error("Échec API test")
          return
        }
        // Aussi sur global pour les overlays sans coopstreamKey
        if (scopeKey !== "global") {
          await fetch("/api/overlay/test", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              kind,
              displayName: event.displayName,
              scopeKey: "global",
            }),
          })
        }
        toast.success(`${OVERLAY_TEST_KINDS.find((k) => k.id === kind)?.label} déclenché`)
      } catch {
        toast.error("Impossible de déclencher le test")
      } finally {
        setBusy(null)
      }
    },
    [coopstreamKey, displayName],
  )

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Test overlays</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Déclenche un toast sur tes sources OBS (même origine) — follow, sub, raid.
          Les overlays écoutent en live via API + BroadcastChannel.
        </p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-background/60 p-5 shadow-sm backdrop-blur-xl">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Pseudo affiché
            </span>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="BryanTest"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              coopstreamKey (optionnel)
            </span>
            <Input
              value={coopstreamKey}
              onChange={(e) => setCoopstreamKey(e.target.value)}
              placeholder="ta clé room"
            />
          </label>
        </div>

        <div className="mt-4">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Preset (liens d’ouverture)
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {OVERLAY_PRESET_OPTIONS.map((option) => {
              const selected = preset === option.id
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setPreset(option.id)
                    try {
                      window.localStorage.setItem(OVERLAY_PRESET_STORAGE_KEY, option.id)
                    } catch {
                      // ignore
                    }
                  }}
                  className={[
                    "rounded-lg border px-3 py-1.5 text-xs font-medium transition",
                    selected
                      ? "border-foreground/40 bg-foreground/10 text-foreground"
                      : "border-border/60 text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {OVERLAY_TEST_KINDS.map((kind) => {
            const href = (() => {
              const url = new URL(PREVIEW_HREFS[kind.id], origin || "http://localhost")
              if (preset !== "default") url.searchParams.set("preset", preset)
              if (coopstreamKey.trim()) {
                url.searchParams.set("coopstreamKey", coopstreamKey.trim())
              }
              return `${url.pathname}?${url.searchParams.toString()}`
            })()

            return (
              <div
                key={kind.id}
                className="flex flex-col gap-2 rounded-xl border border-border/60 bg-background/40 p-3"
              >
                <div className="text-sm font-semibold">{kind.label}</div>
                <div className="text-[11px] text-muted-foreground">{kind.description}</div>
                <Button
                  type="button"
                  size="sm"
                  disabled={busy === kind.id}
                  onClick={() => void fire(kind.id)}
                >
                  {busy === kind.id ? "…" : "Tester"}
                </Button>
                <Button asChild size="sm" variant="secondary">
                  <Link href={href} target="_blank">
                    Ouvrir overlay
                  </Link>
                </Button>
              </div>
            )
          })}
        </div>

        <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
          Astuce OBS : garde tes sources follow / sub / raid ouvertes, puis clique{" "}
          <span className="text-foreground">Tester</span> ici. Le rendu apparaît dans
          le navigateur OBS (poll ~1s). Même origine obligatoire (
          {origin || "ton domaine"}).
        </p>
      </div>
    </div>
  )
}
