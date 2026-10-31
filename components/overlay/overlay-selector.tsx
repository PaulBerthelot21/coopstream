"use client"

import * as React from "react"
import Link from "next/link"
import { Copy } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuthSession } from "@/lib/useAuthSession"
import {
  OVERLAY_PRESET_OPTIONS,
  OVERLAY_PRESET_STORAGE_KEY,
  parseOverlayPreset,
  type OverlayPreset,
} from "@/lib/overlay/presets"
import { INTRO_3D_SCENES, type Intro3dSceneId } from "@/lib/intro-3d-scenes"
import { STINGER_VARIANTS, type StingerVariantId } from "@/lib/stinger-variants"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type OverlayGroupId = "live" | "followers" | "challenges" | "scenes"

type OverlayDef = {
  href: string
  title: string
  description: string
  hint?: string
  group: OverlayGroupId
}

const OVERLAY_GROUPS: {
  id: OverlayGroupId | "all"
  label: string
}[] = [
  { id: "all", label: "Tous" },
  { id: "live", label: "Live" },
  { id: "followers", label: "Followers" },
  { id: "challenges", label: "Défis" },
  { id: "scenes", label: "Scènes" },
]

const OVERLAYS: OverlayDef[] = [
  {
    href: "/overlay-chat",
    title: "Chat Twitch",
    description: "Affiche le chat en mode navigateur dans OBS.",
    hint: "Optionnel : tu peux passer `?channel=...`.",
    group: "live",
  },
  {
    href: "/overlay-talk",
    title: "Talk tranquille",
    description: "Affiche les derniers messages chat dans un style calme.",
    hint: "Optionnel : `?channel=...` ; preset possible.",
    group: "live",
  },
  {
    href: "/overlay-camera",
    title: "Caméra",
    description: "Habillage pour placer ta source vidéo (webcam / capture).",
    hint: "Pas de config technique a faire dans l'app.",
    group: "live",
  },
  {
    href: "/overlay-follower-goal",
    title: "Objectif followers",
    description: "Affiche `current/target` à partir du nombre de followers Twitch.",
    hint: "Requiert une `coopstreamKey` (objectif configuré dans `/admin/follower-goal`).",
    group: "followers",
  },
  {
    href: "/overlay-last-follower",
    title: "Dernier follower",
    description: "Affiche le dernier abonné Twitch (avec compteurs).",
    hint: "Optionnel : `channel` ; pour éviter la config ajoute `coopstreamKey`.",
    group: "followers",
  },
  {
    href: "/overlay-new-follower",
    title: "Nouveau follower (toast)",
    description:
      "Affiche un toast animé quand un nouveau follow arrive pendant le live.",
    hint: "Optionnel : `channel` ; pour éviter la config ajoute `coopstreamKey`.",
    group: "followers",
  },
  {
    href: "/overlay-defi-carrousel",
    title: "Défis / Carrousel",
    description: "Affiche les challenges avec l’état synchronisé par `coopstreamKey`.",
    hint: "Requiert une `coopstreamKey` dans l'URL.",
    group: "challenges",
  },
  {
    href: "/overlay-wheel-texte",
    title: "Roue (défis texte)",
    description: "Affiche une roulette de défis texte (animation casino).",
    hint: "Requiert une `coopstreamKey` dans l'URL.",
    group: "challenges",
  },
  {
    href: "/overlay-intro",
    title: "Intro + Minuteur",
    description: "Affiche un fond animé élégant avec un compte à rebours.",
    hint: "Optionnel : `?seconds=300&subtitle=Le%20live%20commence%20bientot&fx=off|low|medium|high`.",
    group: "scenes",
  },
  {
    href: "/overlay-intro-3d",
    title: "Intro 3D (WebGL)",
    description:
      "Quatre ambiances Three.js (portail, élégance, nébuleuse, vitesse) + minuteur et bloom selon fx.",
    hint: "`?scene=portal|elegance|nebula|pulse` — minuteur / sous-titre / fx : carte « Intro + Minuteur ».",
    group: "scenes",
  },
  {
    href: "/overlay-intro-cs",
    title: "Intro tactique (style CS)",
    description:
      "Scène désert / CT : couteau animé type inspect, caisses, poussière. Pas d’asset Valve — GLB perso optionnel.",
    hint: "Place un modèle en `public/models/cs-intro.glb` pour le remplacer. Sinon minuteur / sous-titre / fx : carte « Intro + Minuteur ».",
    group: "scenes",
  },
  {
    href: "/stinger",
    title: "Stinger OBS (capture)",
    description: "Animation 1920×1080 fond vert pour transition Stinger + chrominance dans OBS.",
    hint: "`?v=diagonal|vertical|iris|glitch` — enregistre l’écran en mode capture puis importe le clip dans OBS.",
    group: "scenes",
  },
  {
    href: "/overlay-outro",
    title: "Outro",
    description: "Affiche un écran de fin avec un message de remerciement.",
    hint: "Optionnel : `?title=Merci%20d%27avoir%20suivi&subtitle=A%20bientot&fx=off|low|medium|high`.",
    group: "scenes",
  },
  {
    href: "/overlay-pause",
    title: "Pause",
    description: "Affiche un écran de pause élégant avec message personnalisable.",
    hint: "Optionnel : `?title=Pause&subtitle=Je%20reviens%20dans%205%20min&fx=off|low|medium|high`.",
    group: "scenes",
  },
]

const COOPSTREAM_KEY_STORAGE = "coopstream-last-coopstreamKey"
const TWITCH_CHANNEL_STORAGE = "coopstream-twitch-channel"
const OVERLAY_GROUP_STORAGE = "coopstream-overlay-group"

const CHANNEL_OVERLAY_HREFS = new Set([
  "/overlay-chat",
  "/overlay-talk",
  "/overlay-follower-goal",
  "/overlay-last-follower",
  "/overlay-new-follower",
])

function parseOverlayGroup(raw?: string | null): OverlayGroupId | "all" {
  if (
    raw === "live" ||
    raw === "followers" ||
    raw === "challenges" ||
    raw === "scenes" ||
    raw === "all"
  ) {
    return raw
  }
  return "live"
}

function normalizeChannel(input: string) {
  let ch = input.trim()
  ch = ch.replace(/^@/, "")
  ch = ch.replace(/^https?:\/\/(www\.)?twitch\.tv\//i, "")
  ch = ch.split("/")[0] ?? ""
  return ch.toLowerCase()
}

function safeCopy(text: string) {
  return new Promise<void>((resolve, reject) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(resolve).catch(reject)
      return
    }

    try {
      const ta = document.createElement("textarea")
      ta.value = text
      ta.style.position = "fixed"
      ta.style.left = "-9999px"
      ta.style.top = "-9999px"
      document.body.appendChild(ta)
      ta.focus()
      ta.select()
      const ok = document.execCommand("copy")
      document.body.removeChild(ta)
      if (ok) resolve()
      else reject(new Error("copy_failed"))
    } catch (e) {
      reject(e)
    }
  })
}

export function OverlaySelector({
  title = "Overlay",
  description = "Choisis quelle source tu veux ajouter dans OBS.",
  showPresetSelector = false,
}: {
  title?: string
  description?: string
  showPresetSelector?: boolean
}) {
  const [origin, setOrigin] = React.useState<string>("")
  const session = useAuthSession()
  const isAuthed = Boolean((session as any)?.user)

  const [coopstreamKey, setCoopstreamKey] = React.useState<string>("")
  const [channel, setChannel] = React.useState<string>("")
  const [preset, setPreset] = React.useState<OverlayPreset>("default")
  const [overlayGroup, setOverlayGroup] = React.useState<OverlayGroupId | "all">("live")
  const [introSeconds, setIntroSeconds] = React.useState<string>("300")
  const [introSubtitle, setIntroSubtitle] = React.useState<string>("")
  const [introFx, setIntroFx] = React.useState<"low" | "medium" | "high" | "off">("medium")
  const [outroTitle, setOutroTitle] = React.useState<string>("Merci d'avoir suivi")
  const [outroSubtitle, setOutroSubtitle] = React.useState<string>("")
  const [outroFx, setOutroFx] = React.useState<"low" | "medium" | "high" | "off">("medium")
  const [pauseTitle, setPauseTitle] = React.useState<string>("Pause")
  const [pauseSubtitle, setPauseSubtitle] = React.useState<string>("")
  const [pauseFx, setPauseFx] = React.useState<"low" | "medium" | "high" | "off">("medium")
  const [stingerVariant, setStingerVariant] = React.useState<StingerVariantId>("iris")
  const [intro3dScene, setIntro3dScene] = React.useState<Intro3dSceneId>("elegance")

  React.useEffect(() => {
    try {
      setOrigin(window.location.origin)
    } catch {
      setOrigin("")
    }
  }, [])

  React.useEffect(() => {
    try {
      setPreset(parseOverlayPreset(window.localStorage.getItem(OVERLAY_PRESET_STORAGE_KEY) ?? undefined))
      setOverlayGroup(parseOverlayGroup(window.localStorage.getItem(OVERLAY_GROUP_STORAGE)))
    } catch {
      // ignore
    }
  }, [])

  const selectPreset = React.useCallback((next: OverlayPreset) => {
    setPreset(next)
    try {
      window.localStorage.setItem(OVERLAY_PRESET_STORAGE_KEY, next)
    } catch {
      // ignore
    }
  }, [])

  const selectOverlayGroup = React.useCallback((next: OverlayGroupId | "all") => {
    setOverlayGroup(next)
    try {
      window.localStorage.setItem(OVERLAY_GROUP_STORAGE, next)
    } catch {
      // ignore
    }
  }, [])

  const visibleOverlays = React.useMemo(
    () =>
      overlayGroup === "all"
        ? OVERLAYS
        : OVERLAYS.filter((o) => o.group === overlayGroup),
    [overlayGroup],
  )

  const showSharedChannel =
    isAuthed &&
    visibleOverlays.some((o) => CHANNEL_OVERLAY_HREFS.has(o.href))

  React.useEffect(() => {
    if (!isAuthed) {
      setCoopstreamKey("")
      setChannel("")
      return
    }

    // Valeur optimiste depuis localStorage (évite un flash vide).
    try {
      setCoopstreamKey(
        window.localStorage.getItem(COOPSTREAM_KEY_STORAGE) ?? "",
      )
    } catch {
      setCoopstreamKey("")
    }

    // Pré-remplissage du channel Twitch.
    try {
      const stored = window.localStorage.getItem(TWITCH_CHANNEL_STORAGE) ?? ""
      const sessionUser = (session as any)?.user as
        | { name?: string; email?: string }
        | undefined
      const candidate =
        stored.trim() ||
        sessionUser?.name?.toString()?.trim() ||
        sessionUser?.email?.toString()?.trim() ||
        ""

      setChannel(candidate ? normalizeChannel(candidate) : "")
    } catch {
      setChannel("")
    }

    // Confirmation côté backend : 1 seule coopstreamKey stable par utilisateur.
    ;(async () => {
      try {
        const res = await fetch("/api/coopstream/rooms/me", { cache: "no-store" })
        if (!res.ok) return
        const data = (await res.json()) as { coopstreamKey?: string }
        const key = data?.coopstreamKey?.trim() ?? ""
        if (!key) return

        setCoopstreamKey(key)
        try {
          window.localStorage.setItem(COOPSTREAM_KEY_STORAGE, key)
        } catch {
          // ignore
        }
      } catch {
        // ignore
      }
    })()
  }, [isAuthed, session])

  const buildOverlayHref = React.useCallback(
    (href: string) => {
      // Aujourd’hui, on injecte seulement si l’utilisateur est connecté.
      if (!isAuthed) return href

      const url = new URL(href, origin || "http://localhost")
      let changed = false

      if (
        (href === "/overlay-defi-carrousel" ||
          href === "/overlay-follower-goal" ||
          href === "/overlay-wheel-texte" ||
          href === "/overlay-last-follower" ||
          href === "/overlay-new-follower") &&
        coopstreamKey
      ) {
        url.searchParams.set("coopstreamKey", coopstreamKey)
        changed = true
      }

      if (
        (href === "/overlay-chat" ||
          href === "/overlay-talk" ||
          href === "/overlay-follower-goal" ||
          href === "/overlay-last-follower" ||
          href === "/overlay-new-follower") &&
        channel
      ) {
        url.searchParams.set("channel", normalizeChannel(channel))
        changed = true
      }

      if (!changed) return href
      return `${url.pathname}?${url.searchParams.toString()}`
    },
    [channel, coopstreamKey, isAuthed, origin],
  )

  const copyOverlayLink = React.useCallback(async (fullUrl: string) => {
    try {
      await safeCopy(fullUrl)
      toast.success("Lien overlay copié")
    } catch {
      toast.error("Impossible de copier le lien. Copie-le manuellement.")
    }
  }, [])

  return (
    <div className="min-h-[360px] w-full bg-transparent flex items-center justify-center px-0">
      <div className="w-full max-w-5xl py-8 px-4">
        <div className="rounded-2xl border border-border/60 bg-background/60 p-6 shadow-sm backdrop-blur-xl">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          {showPresetSelector ? (
            <div className="mt-5">
              <div className="flex items-baseline justify-between gap-3">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Preset
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Mémorisé sur cet appareil · overlays compatibles
                </div>
              </div>
              <div
                role="radiogroup"
                aria-label="Preset overlay"
                className="mt-2.5 grid gap-2 sm:grid-cols-3"
              >
                {OVERLAY_PRESET_OPTIONS.map((option) => {
                  const selected = preset === option.id
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => selectPreset(option.id)}
                      className={[
                        "group relative overflow-hidden rounded-xl border px-3 py-3 text-left transition",
                        selected
                          ? "border-foreground/40 bg-foreground/[0.06] shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
                          : "border-border/60 bg-background/40 hover:border-border hover:bg-background/70",
                      ].join(" ")}
                    >
                      <div
                        className="h-10 w-full rounded-lg ring-1 ring-white/10"
                        style={{ backgroundImage: option.swatch }}
                      />
                      <div className="mt-2.5 flex items-center justify-between gap-2">
                        <div className="text-sm font-semibold tracking-tight text-foreground">
                          {option.label}
                        </div>
                        <span
                          className={[
                            "inline-flex h-4 w-4 items-center justify-center rounded-full border transition",
                            selected
                              ? "border-emerald-400/80 bg-emerald-400/90"
                              : "border-muted-foreground/40 bg-transparent",
                          ].join(" ")}
                          aria-hidden
                        >
                          {selected ? (
                            <span className="h-1.5 w-1.5 rounded-full bg-background" />
                          ) : null}
                        </span>
                      </div>
                      <div className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                        {option.description}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : null}

          <div className="mt-6 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div
                role="tablist"
                aria-label="Catégories overlays"
                className="inline-flex flex-wrap gap-1 rounded-xl border border-border/60 bg-muted/30 p-1"
              >
                {OVERLAY_GROUPS.map((group) => {
                  const selected = overlayGroup === group.id
                  const count =
                    group.id === "all"
                      ? OVERLAYS.length
                      : OVERLAYS.filter((o) => o.group === group.id).length
                  return (
                    <button
                      key={group.id}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => selectOverlayGroup(group.id)}
                      className={[
                        "rounded-lg px-3 py-1.5 text-xs font-medium transition",
                        selected
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground",
                      ].join(" ")}
                    >
                      {group.label}
                      <span className="ml-1.5 text-[10px] text-muted-foreground">
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {visibleOverlays.length} overlay
                {visibleOverlays.length > 1 ? "s" : ""}
              </div>
            </div>

            {showSharedChannel ? (
              <div className="flex flex-col gap-1.5 rounded-xl border border-border/60 bg-background/40 px-3 py-2.5 sm:flex-row sm:items-center sm:gap-3">
                <div className="shrink-0 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Channel
                </div>
                <Input
                  value={channel}
                  placeholder="anthemtv_"
                  onChange={(e) => {
                    const next = normalizeChannel(e.target.value)
                    setChannel(next)
                    try {
                      window.localStorage.setItem(TWITCH_CHANNEL_STORAGE, next)
                    } catch {
                      // ignore
                    }
                  }}
                  className="h-8"
                />
              </div>
            ) : null}
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {visibleOverlays.map((o) => (
              <Card key={o.href} className="bg-background/40">
                <CardHeader>
                  <CardTitle>{o.title}</CardTitle>
                  <CardDescription>{o.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {o.hint ? (
                    <div className="text-xs text-muted-foreground">{o.hint}</div>
                  ) : null}

                  {o.href === "/overlay-intro-cs" ? (
                    <div className="rounded-md border border-dashed border-border/80 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                      Minuteur, sous-titre et fx : carte{" "}
                      <span className="font-medium text-foreground">Intro + Minuteur</span>. Fichier
                      optionnel :{" "}
                      <code className="rounded bg-muted px-1 py-0.5 text-[10px]">
                        public/models/cs-intro.glb
                      </code>
                    </div>
                  ) : null}

                  {o.href === "/overlay-intro-3d" ? (
                    <div className="flex flex-col gap-2">
                      <div className="rounded-md border border-dashed border-border/80 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                        Minuteur, sous-titre et fx : carte{" "}
                        <span className="font-medium text-foreground">Intro + Minuteur</span>.
                      </div>
                      <div className="text-xs font-semibold text-muted-foreground">
                        Scène 3D
                      </div>
                      <select
                        value={intro3dScene}
                        onChange={(e) =>
                          setIntro3dScene(e.target.value as Intro3dSceneId)
                        }
                        className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                      >
                        {INTRO_3D_SCENES.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {
                          INTRO_3D_SCENES.find((s) => s.id === intro3dScene)
                            ?.description
                        }
                      </p>
                    </div>
                  ) : null}

                  {o.href === "/stinger" ? (
                    <div className="flex flex-col gap-2">
                      <div className="text-xs font-semibold text-muted-foreground">
                        Variante stinger
                      </div>
                      <select
                        value={stingerVariant}
                        onChange={(e) =>
                          setStingerVariant(e.target.value as StingerVariantId)
                        }
                        className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                      >
                        {STINGER_VARIANTS.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}

                  {o.href === "/overlay-intro" ? (
                    <div className="flex flex-col gap-2">
                      <div className="text-xs font-semibold text-muted-foreground">
                        Paramètres Intro
                      </div>
                      <Input
                        value={introSeconds}
                        placeholder="300"
                        inputMode="numeric"
                        onChange={(e) => setIntroSeconds(e.target.value)}
                      />
                      <Input
                        value={introSubtitle}
                        placeholder="Le live commence bientôt"
                        onChange={(e) => setIntroSubtitle(e.target.value)}
                      />
                      <select
                        value={introFx}
                        onChange={(e) =>
                          setIntroFx(
                            (e.target.value as "low" | "medium" | "high" | "off") ??
                              "medium",
                          )
                        }
                        className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                      >
                        <option value="off">fx off</option>
                        <option value="low">fx low</option>
                        <option value="medium">fx medium</option>
                        <option value="high">fx high</option>
                      </select>
                    </div>
                  ) : null}

                  {o.href === "/overlay-outro" ? (
                    <div className="flex flex-col gap-2">
                      <div className="text-xs font-semibold text-muted-foreground">
                        Paramètres Outro
                      </div>
                      <Input
                        value={outroTitle}
                        placeholder="Merci d'avoir suivi"
                        onChange={(e) => setOutroTitle(e.target.value)}
                      />
                      <Input
                        value={outroSubtitle}
                        placeholder="À bientôt pour le prochain live"
                        onChange={(e) => setOutroSubtitle(e.target.value)}
                      />
                      <select
                        value={outroFx}
                        onChange={(e) =>
                          setOutroFx(
                            (e.target.value as "low" | "medium" | "high" | "off") ??
                              "medium",
                          )
                        }
                        className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                      >
                        <option value="off">fx off</option>
                        <option value="low">fx low</option>
                        <option value="medium">fx medium</option>
                        <option value="high">fx high</option>
                      </select>
                    </div>
                  ) : null}

                  {o.href === "/overlay-pause" ? (
                    <div className="flex flex-col gap-2">
                      <div className="text-xs font-semibold text-muted-foreground">
                        Paramètres Pause
                      </div>
                      <Input
                        value={pauseTitle}
                        placeholder="Pause"
                        onChange={(e) => setPauseTitle(e.target.value)}
                      />
                      <Input
                        value={pauseSubtitle}
                        placeholder="Je reviens dans 5 minutes"
                        onChange={(e) => setPauseSubtitle(e.target.value)}
                      />
                      <select
                        value={pauseFx}
                        onChange={(e) =>
                          setPauseFx(
                            (e.target.value as "low" | "medium" | "high" | "off") ??
                              "medium",
                          )
                        }
                        className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                      >
                        <option value="off">fx off</option>
                        <option value="low">fx low</option>
                        <option value="medium">fx medium</option>
                        <option value="high">fx high</option>
                      </select>
                    </div>
                  ) : null}

                  {(() => {
                    const baseHref = buildOverlayHref(o.href)
                    const relativeHref = (() => {
                      const url = new URL(baseHref, origin || "http://localhost")
                      if (
                        showPresetSelector &&
                        preset !== "default" &&
                        (o.href === "/overlay-chat" ||
                          o.href === "/overlay-talk" ||
                          o.href === "/overlay-camera" ||
                          o.href === "/overlay-defi-carrousel" ||
                          o.href === "/overlay-follower-goal" ||
                          o.href === "/overlay-last-follower" ||
                          o.href === "/overlay-new-follower" ||
                          o.href === "/overlay-wheel-texte")
                      ) {
                        url.searchParams.set("preset", preset)
                      }

                      if (
                        o.href === "/overlay-intro" ||
                        o.href === "/overlay-intro-3d" ||
                        o.href === "/overlay-intro-cs"
                      ) {
                        const sec = Number(introSeconds)
                        if (Number.isFinite(sec) && sec > 0) {
                          url.searchParams.set("seconds", String(Math.floor(sec)))
                        }
                        const sub = introSubtitle.trim()
                        if (sub) {
                          url.searchParams.set("subtitle", sub)
                        }
                        if (introFx !== "medium") {
                          url.searchParams.set("fx", introFx)
                        }
                      }
                      if (o.href === "/overlay-intro-3d") {
                        url.searchParams.set("scene", intro3dScene)
                      }
                      if (o.href === "/stinger") {
                        url.searchParams.set("v", stingerVariant)
                      }
                      if (o.href === "/overlay-outro") {
                        const t = outroTitle.trim()
                        if (t) {
                          url.searchParams.set("title", t)
                        }
                        const sub = outroSubtitle.trim()
                        if (sub) {
                          url.searchParams.set("subtitle", sub)
                        }
                        if (outroFx !== "medium") {
                          url.searchParams.set("fx", outroFx)
                        }
                      }
                      if (o.href === "/overlay-pause") {
                        const t = pauseTitle.trim()
                        if (t) {
                          url.searchParams.set("title", t)
                        }
                        const sub = pauseSubtitle.trim()
                        if (sub) {
                          url.searchParams.set("subtitle", sub)
                        }
                        if (pauseFx !== "medium") {
                          url.searchParams.set("fx", pauseFx)
                        }
                      }

                      if (!url.searchParams.toString()) return url.pathname
                      return `${url.pathname}?${url.searchParams.toString()}`
                    })()
                    const fullUrl = origin ? `${origin}${relativeHref}` : relativeHref

                    return (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Input
                            value={fullUrl}
                            readOnly
                            onFocus={(e) => e.currentTarget.select()}
                            aria-label={`Lien ${o.title}`}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="shrink-0"
                            onClick={() => void copyOverlayLink(fullUrl)}
                            aria-label={`Copier le lien ${o.title}`}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>

                        <Button asChild size="sm" variant="secondary">
                          <Link href={relativeHref}>Ouvrir l'overlay</Link>
                        </Button>
                      </div>
                    )
                  })()}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

