"use client"

import * as React from "react"
import Link from "next/link"
import { Copy } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuthSession } from "@/lib/useAuthSession"
import type { OverlayPreset } from "@/lib/overlay/presets"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type OverlayDef = {
  href: string
  title: string
  description: string
  hint?: string
}

const OVERLAYS: OverlayDef[] = [
  {
    href: "/overlay-chat",
    title: "Chat Twitch",
    description: "Affiche le chat en mode navigateur dans OBS.",
    hint: "Optionnel : tu peux passer `?channel=...`.",
  },
  {
    href: "/overlay-defi-carrousel",
    title: "Défis / Carrousel",
    description: "Affiche les challenges avec l’état synchronisé par `coopstreamKey`.",
    hint: "Requiert une `coopstreamKey` dans l'URL.",
  },
  {
    href: "/overlay-follower-goal",
    title: "Objectif followers",
    description: "Affiche `current/target` à partir du nombre de followers Twitch.",
    hint: "Requiert une `coopstreamKey` (objectif configuré dans `/admin/follower-goal`).",
  },
  {
    href: "/overlay-last-follower",
    title: "Dernier follower",
    description: "Affiche le dernier abonné Twitch (avec compteurs).",
    hint: "Optionnel : `channel` ; pour éviter la config ajoute `coopstreamKey`.",
  },
  {
    href: "/overlay-new-follower",
    title: "Nouveau follower (toast)",
    description:
      "Affiche un toast animé quand un nouveau follow arrive pendant le live.",
    hint: "Optionnel : `channel` ; pour éviter la config ajoute `coopstreamKey`.",
  },
  {
    href: "/overlay-wheel-texte",
    title: "Roue (défis texte)",
    description: "Affiche une roulette de défis texte (animation casino).",
    hint: "Requiert une `coopstreamKey` dans l'URL.",
  },
  {
    href: "/overlay-camera",
    title: "Caméra",
    description: "Habillage pour placer ta source vidéo (webcam / capture).",
    hint: "Pas de config technique a faire dans l'app.",
  },
  {
    href: "/overlay-intro",
    title: "Intro + Minuteur",
    description: "Affiche un fond animé élégant avec un compte à rebours.",
    hint: "Optionnel : `?seconds=300&subtitle=Le%20live%20commence%20bientot&fx=off|low|medium|high`.",
  },
  {
    href: "/overlay-outro",
    title: "Outro",
    description: "Affiche un écran de fin avec un message de remerciement.",
    hint: "Optionnel : `?title=Merci%20d%27avoir%20suivi&subtitle=A%20bientot&fx=off|low|medium|high`.",
  },
]

const COOPSTREAM_KEY_STORAGE = "coopstream-last-coopstreamKey"
const TWITCH_CHANNEL_STORAGE = "coopstream-twitch-channel"

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
  const [introSeconds, setIntroSeconds] = React.useState<string>("300")
  const [introSubtitle, setIntroSubtitle] = React.useState<string>("")
  const [introFx, setIntroFx] = React.useState<"low" | "medium" | "high" | "off">("medium")
  const [outroTitle, setOutroTitle] = React.useState<string>("Merci d'avoir suivi")
  const [outroSubtitle, setOutroSubtitle] = React.useState<string>("")
  const [outroFx, setOutroFx] = React.useState<"low" | "medium" | "high" | "off">("medium")

  React.useEffect(() => {
    try {
      setOrigin(window.location.origin)
    } catch {
      setOrigin("")
    }
  }, [])

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
            <div className="mt-4 flex items-center gap-2">
              <label
                htmlFor="overlay-preset"
                className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"
              >
                Preset
              </label>
              <select
                id="overlay-preset"
                value={preset}
                onChange={(e) => setPreset(e.target.value as OverlayPreset)}
                className="h-8 rounded-md border border-input bg-background px-2 text-xs"
              >
                <option value="default">default</option>
                <option value="lecalme">lecalme</option>
              </select>
              <span className="text-xs text-muted-foreground">
                Appliqué aux overlays compatibles.
              </span>
            </div>
          ) : null}

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {OVERLAYS.map((o) => (
              <Card key={o.href} className="bg-background/40">
                <CardHeader>
                  <CardTitle>{o.title}</CardTitle>
                  <CardDescription>{o.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {o.hint ? (
                    <div className="text-xs text-muted-foreground">{o.hint}</div>
                  ) : null}

                  {isAuthed &&
                  (o.href === "/overlay-chat" ||
                    o.href === "/overlay-follower-goal" ||
                    o.href === "/overlay-last-follower" ||
                    o.href === "/overlay-new-follower") ? (
                    <div className="flex flex-col gap-2">
                      <div className="text-xs font-semibold text-muted-foreground">
                        Channel Twitch
                      </div>
                      <Input
                        value={channel}
                        placeholder="anthemtv_"
                        onChange={(e) =>
                          setChannel(normalizeChannel(e.target.value))
                        }
                      />
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

                  {(() => {
                    const baseHref = buildOverlayHref(o.href)
                    const relativeHref = (() => {
                      const url = new URL(baseHref, origin || "http://localhost")
                      if (
                        showPresetSelector &&
                        preset !== "default" &&
                        (o.href === "/overlay-chat" ||
                          o.href === "/overlay-camera" ||
                          o.href === "/overlay-defi-carrousel" ||
                          o.href === "/overlay-follower-goal" ||
                          o.href === "/overlay-last-follower" ||
                          o.href === "/overlay-new-follower" ||
                          o.href === "/overlay-wheel-texte")
                      ) {
                        url.searchParams.set("preset", preset)
                      }

                      if (o.href === "/overlay-intro") {
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

