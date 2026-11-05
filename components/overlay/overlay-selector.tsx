"use client"

import * as React from "react"
import Link from "next/link"
import { useOverlayPreset } from "./overlay-preset-provider"
import { SOCIAL_PLATFORMS, CHIBI_VARIANTS, parseSocialPlatform, parseChibiVariant } from "@/lib/overlay/live-elements"
import { Copy, Download } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuthSession } from "@/lib/useAuthSession"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type OverlayGroupId = "live" | "followers" | "challenges" | "scenes" | "elements"

type OverlayDef = {
  href: string
  title: string
  description: string
  webmUrl?: string
  pngUrl?: string
  rebrandOnly?: boolean
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
  { id: "elements", label: "Éléments" },
]

const OVERLAYS: OverlayDef[] = [
  { href: "/overlay-background", title: "Fond de scène Chat", description: "Le fond marbré de la scène Chat, séparé des cadres et des widgets.", hint: "Place cette source tout en bas dans OBS, en 1920 × 1080. Le PNG est aussi utilisable comme source Image.", group: "elements", rebrandOnly: true, pngUrl: "/overlays/lecalme-rebrand/scene-chat-bg.png" },
  { href: "/overlay-social", title: "Carte réseau social", description: "La carte de l’intro, indépendante : choisis le réseau et le compte à afficher.", hint: "Compte personnalisé ou compte enregistré dans Live → Infos à l’écran. OBS : 440 × 180.", group: "live" },
  { href: "/overlay-followers-summary", title: "Followers · compteur & dernier", description: "Le compteur, l’objectif et le dernier follower réunis dans la carte de l’intro.", hint: "Utilise ton canal Twitch et l’objectif configuré dans Live. OBS : 440 × 340.", group: "live" },
  { href: "/overlay-brand-title", title: "Titre Le Calme", webmUrl: "/overlays/lecalme-rebrand/title-animated.webm", description: "Le titre complet de l’intro : LE CALME ARRIVE BIENTÔT, avec ses entrées et mouvements d’origine.", hint: "Titre complet indépendant du rebrand. Source OBS : 1920 × 1080 ; WebM transparent : 700 × 620.", group: "elements", rebrandOnly: true },
  { href: "/overlay-chibi", title: "Chibi", description: "Un chibi du rebrand, seul et repositionnable dans OBS.", hint: "Choisis la variante et active ou coupe le flottement. OBS : 400 × 400.", group: "elements", rebrandOnly: true },
  { href: "/overlay-timer", title: "Minuteur", description: "Le compte à rebours de l’intro en source indépendante, sans fond.", hint: "Démarre au chargement de la source, reste à 00:00 en fin de décompte. OBS : 480 × 200.", group: "elements" },
  {
    href: "/overlay-chat",
    title: "Chat Twitch",
    description: "Affiche le chat en mode navigateur dans OBS.",
    hint: "Optionnel : `?channel=...`. Son on par défaut ; `sound=0` pour couper ; `soundUrl=/ton.mp3`.",
    group: "live",
  },
  {
    href: "/overlay-planning",
    title: "Planning",
    description: "Affiche les prochains lives du planning Twitch.",
    hint: "Optionnel : `?channel=...` ; `coopstreamKey` recommandé. Configure le planning sur Twitch.",
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
    hint: "Optionnel : `channel` + `coopstreamKey`. Son activé par défaut ; `soundUrl=/ton.mp3` ou `sound=0` pour couper. OBS : ne pas mute la source.",
    group: "followers",
  },
  {
    href: "/overlay-new-sub",
    title: "Nouveau sub (toast)",
    description:
      "Affiche un toast animé quand un nouvel abonnement Twitch arrive pendant le live.",
    hint: "Requiert le scope `channel:read:subscriptions` (reconnecte Twitch) + `coopstreamKey` recommandé.",
    group: "followers",
  },
  {
    href: "/overlay-new-raid",
    title: "Nouveau raid (toast)",
    description:
      "Affiche un toast animé quand un raid arrive sur la chaîne (EventSub).",
    hint: "Optionnel : `channel` + `coopstreamKey` pour s’abonner à EventSub `channel.raid`.",
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
    title: "Intro",
    description: "Affiche un fond animé élégant avec un compte à rebours.",
    hint: "Optionnel : `?seconds=300&subtitle=Le%20live%20commence%20bientot&fx=off|low|medium|high`.",
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
  {
    href: "/overlay-scene-chat",
    title: "Chat",
    description:
      "Scène complète : fond, titre animé, écran, webcam, chat et objectif followers.",
    hint: "Scène assemblée en 1920 × 1080. Dans OBS, place tes captures écran et webcam au-dessus du fond dans les emplacements prévus.",
    group: "scenes",
  },
]

const COOPSTREAM_KEY_STORAGE = "coopstream-last-coopstreamKey"
const TWITCH_CHANNEL_STORAGE = "coopstream-twitch-channel"
const OVERLAY_GROUP_STORAGE = "coopstream-overlay-group"

const CHANNEL_OVERLAY_HREFS = new Set([
  "/overlay-followers-summary",
  "/overlay-chat",
  "/overlay-planning",
  "/overlay-follower-goal",
  "/overlay-last-follower",
  "/overlay-new-follower",
  "/overlay-new-sub",
  "/overlay-new-raid",
  "/overlay-scene-chat",
])

function parseOverlayGroup(raw?: string | null): OverlayGroupId | "all" {
  if (
    raw === "live" ||
    raw === "followers" ||
    raw === "challenges" ||
    raw === "scenes" ||
    raw === "elements" ||
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
}: {
  title?: string
  description?: string
}) {
  const [origin, setOrigin] = React.useState<string>("")
  const session = useAuthSession()
  const sessionUser = (session as { user?: { name?: string; email?: string } } | null)?.user
  const isAuthed = Boolean(sessionUser)

  const [coopstreamKey, setCoopstreamKey] = React.useState<string>("")
  const [channel, setChannel] = React.useState<string>("")
  const { preset } = useOverlayPreset()
  const [overlayGroup, setOverlayGroup] = React.useState<OverlayGroupId | "all">("live")
  const [socialPlatform, setSocialPlatform] = React.useState("youtube")
  const [socialHandle, setSocialHandle] = React.useState("")
  const [chibiVariant, setChibiVariant] = React.useState("goal")
  const [animateTitle, setAnimateTitle] = React.useState(true)
  const [animateChibi, setAnimateChibi] = React.useState(true)
  const [timerSeconds, setTimerSeconds] = React.useState("300")
  const [introSeconds, setIntroSeconds] = React.useState<string>("300")
  const [introSubtitle, setIntroSubtitle] = React.useState<string>("")
  const [introFx, setIntroFx] = React.useState<"low" | "medium" | "high" | "off">("medium")
  const [outroTitle, setOutroTitle] = React.useState<string>("Merci d'avoir suivi")
  const [outroSubtitle, setOutroSubtitle] = React.useState<string>("")
  const [outroFx, setOutroFx] = React.useState<"low" | "medium" | "high" | "off">("medium")
  const [pauseTitle, setPauseTitle] = React.useState<string>("Pause")
  const [pauseSubtitle, setPauseSubtitle] = React.useState<string>("")
  const [pauseFx, setPauseFx] = React.useState<"low" | "medium" | "high" | "off">("medium")
  React.useEffect(() => {
    try {
      setOrigin(window.location.origin)
    } catch {
      setOrigin("")
    }
  }, [])

  React.useEffect(() => {
    try {
      setOverlayGroup(parseOverlayGroup(window.localStorage.getItem(OVERLAY_GROUP_STORAGE)))
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

  const availableOverlays = React.useMemo(() => OVERLAYS.filter(o => !o.rebrandOnly || preset === "lecalme-rebrand"), [preset])
  const visibleOverlays = React.useMemo(() => overlayGroup === "all" ? availableOverlays : availableOverlays.filter(o => o.group === overlayGroup), [overlayGroup, availableOverlays])
  const showSharedChannel = visibleOverlays.some(o => CHANNEL_OVERLAY_HREFS.has(o.href))

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
  }, [isAuthed, session, sessionUser?.name, sessionUser?.email])

  const buildOverlayHref = React.useCallback(
    (href: string) => {
      // Aujourd’hui, on injecte seulement si l’utilisateur est connecté.
      if (!isAuthed) return href

      const url = new URL(href, origin || "http://localhost")
      let changed = false

      if (
        (href === "/overlay-social" ||
          href === "/overlay-followers-summary" ||
          href === "/overlay-defi-carrousel" ||
          href === "/overlay-follower-goal" ||
          href === "/overlay-wheel-texte" ||
          href === "/overlay-last-follower" ||
          href === "/overlay-new-follower" ||
          href === "/overlay-new-sub" ||
          href === "/overlay-new-raid" ||
          href === "/overlay-intro" ||
          href === "/overlay-outro" ||
          href === "/overlay-pause" ||
          href === "/overlay-scene-chat" ||
          href === "/overlay-planning") &&
        coopstreamKey
      ) {
        url.searchParams.set("coopstreamKey", coopstreamKey)
        changed = true
      }

      if (
        (href === "/overlay-followers-summary" || href === "/overlay-chat" ||
          href === "/overlay-planning" ||
          href === "/overlay-follower-goal" ||
          href === "/overlay-last-follower" ||
          href === "/overlay-new-follower" ||
          href === "/overlay-new-sub" ||
          href === "/overlay-new-raid" ||
          href === "/overlay-intro" ||
          href === "/overlay-outro" ||
          href === "/overlay-pause" ||
          href === "/overlay-scene-chat") &&
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
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </div>
            <Button asChild size="sm" variant="secondary">
              <Link href="/overlay-test">Écran de test</Link>
            </Button>
          </div>
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
                      ? availableOverlays.length
                      : availableOverlays.filter((o) => o.group === group.id).length
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
                  {o.href === "/overlay-brand-title" && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={animateTitle} onChange={e => setAnimateTitle(e.target.checked)} />Animer le titre</label>}
                  {o.href === "/overlay-brand-title" && (
                    <div className="overflow-hidden rounded-xl border border-border bg-muted/30">
                      <div className="border-b border-border px-3 py-2 text-xs text-muted-foreground">Aperçu en direct · {animateTitle ? "Animation activée" : "Titre fixe"}</div>
                      <iframe
                        key={animateTitle ? "animated" : "still"}
                        title="Aperçu du titre Le Calme"
                        src={`/overlay-brand-title?animate=${animateTitle ? "1" : "0"}`}
                        className="pointer-events-none aspect-[700/620] w-full border-0"
                        tabIndex={-1}
                      />
                    </div>
                  )}
                  {o.webmUrl && <Button asChild size="sm" variant="outline" className="self-start"><a href={o.webmUrl} download="le-calme-titre-anime.webm"><Download className="mr-2 h-4 w-4" />Exporter le titre complet animé · WebM transparent</a></Button>}
                  {o.pngUrl && <Button asChild size="sm" variant="outline" className="self-start"><a href={o.pngUrl} download="fond-scene-chat-rebrand-1920x1080.png"><Download className="mr-2 h-4 w-4" />Exporter PNG · 1920 × 1080</a></Button>}
                  {o.hint ? (
                    <div className="text-xs text-muted-foreground">{o.hint}</div>
                  ) : null}

                  {o.href === "/overlay-social" && <div className="space-y-3"><label className="block space-y-1 text-xs text-muted-foreground">Réseau<select aria-label="Réseau social" value={socialPlatform} onChange={e => setSocialPlatform(parseSocialPlatform(e.target.value))} className="h-9 w-full rounded-md border border-input bg-background px-2">{SOCIAL_PLATFORMS.map(value => <option key={value} value={value}>{value === "youtube" ? "YouTube" : value === "tiktok" ? "TikTok" : value === "twitch" ? "Twitch" : "Instagram"}</option>)}</select></label><Input aria-label="Compte du réseau social" placeholder="@toncompte · vide = compte enregistré" value={socialHandle} onChange={e => setSocialHandle(e.target.value)} /></div>}
                  {o.href === "/overlay-chibi" && <div className="space-y-3"><label className="block space-y-1 text-xs text-muted-foreground">Variante<select aria-label="Variante du chibi" value={chibiVariant} onChange={e => setChibiVariant(parseChibiVariant(e.target.value))} className="h-9 w-full rounded-md border border-input bg-background px-2">{CHIBI_VARIANTS.map(value => <option key={value} value={value}>{({ goal: "Objectif", follow: "Follow", sub: "Sub", raid: "Raid" })[value]}</option>)}</select></label><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={animateChibi} onChange={e => setAnimateChibi(e.target.checked)} />Animation de flottement</label></div>}
                  {o.href === "/overlay-timer" && <label className="space-y-1 text-xs text-muted-foreground">Durée en secondes<Input aria-label="Durée du minuteur en secondes" type="number" min={0} max={86400} value={timerSeconds} onChange={e => setTimerSeconds(e.target.value)} /></label>}
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
                        preset !== "default" &&
                        (o.href === "/overlay-social" || o.href === "/overlay-followers-summary" || o.href === "/overlay-timer" || o.href === "/overlay-background" || o.href === "/overlay-chat" ||
                          o.href === "/overlay-planning" ||
                          o.href === "/overlay-camera" ||
                          o.href === "/overlay-defi-carrousel" ||
                          o.href === "/overlay-follower-goal" ||
                          o.href === "/overlay-last-follower" ||
                          o.href === "/overlay-new-follower" ||
                          o.href === "/overlay-new-sub" ||
                          o.href === "/overlay-new-raid" ||
                          o.href === "/overlay-wheel-texte" ||
                          o.href === "/overlay-intro" ||
                          o.href === "/overlay-outro" ||
                          o.href === "/overlay-pause" ||
                          o.href === "/overlay-scene-chat")
                      ) {
                        url.searchParams.set("preset", preset)
                      }

                      if (o.href === "/overlay-brand-title") url.searchParams.set("animate", animateTitle ? "1" : "0")
                      if (o.href === "/overlay-social") {
                        url.searchParams.set("platform", socialPlatform)
                        if (socialHandle.trim()) url.searchParams.set("handle", socialHandle.trim())
                      }
                      if (o.href === "/overlay-followers-summary" && channel.trim()) url.searchParams.set("channel", normalizeChannel(channel))
                      if (o.href === "/overlay-chibi") { url.searchParams.set("variant", chibiVariant); url.searchParams.set("animate", animateChibi ? "1" : "0") }
                      if (o.href === "/overlay-timer") { const value = Number(timerSeconds); url.searchParams.set("seconds", String(Number.isFinite(value) ? Math.max(0, Math.min(86400, Math.floor(value))) : 300)) }
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
                          <Link href={relativeHref}>Ouvrir l’overlay</Link>
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

