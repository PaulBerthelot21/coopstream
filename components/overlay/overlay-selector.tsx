"use client"

import * as React from "react"
import Link from "next/link"
import { Copy } from "lucide-react"
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
    href: "/overlay-last-follower",
    title: "Dernier follower",
    description: "Affiche le dernier abonné Twitch (avec compteurs).",
    hint: "Optionnel : tu peux passer `?channel=...`.",
  },
  {
    href: "/overlay-camera",
    title: "Caméra",
    description: "Habillage pour placer ta source vidéo (webcam / capture).",
    hint: "Pas de config technique a faire dans l'app.",
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
}: {
  title?: string
  description?: string
}) {
  const [origin, setOrigin] = React.useState<string>("")
  const session = useAuthSession()
  const isAuthed = Boolean((session as any)?.user)

  const [coopstreamKey, setCoopstreamKey] = React.useState<string>("")
  const [channel, setChannel] = React.useState<string>("")

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

    try {
      setCoopstreamKey(
        window.localStorage.getItem(COOPSTREAM_KEY_STORAGE) ?? "",
      )
    } catch {
      setCoopstreamKey("")
    }

    try {
      setChannel(window.localStorage.getItem(TWITCH_CHANNEL_STORAGE) ?? "")
    } catch {
      setChannel("")
    }
  }, [isAuthed])

  const buildOverlayHref = React.useCallback(
    (href: string) => {
      // Aujourd’hui, on injecte seulement si l’utilisateur est connecté.
      if (!isAuthed) return href

      const url = new URL(href, origin || "http://localhost")
      let changed = false

      if (href === "/overlay-defi-carrousel" && coopstreamKey) {
        url.searchParams.set("coopstreamKey", coopstreamKey)
        changed = true
      }

      if (
        (href === "/overlay-chat" || href === "/overlay-last-follower") &&
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
      <div className="w-full max-w-5xl px-4">
        <div className="rounded-2xl border border-border/60 bg-background/60 p-6 shadow-sm backdrop-blur-xl">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>

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
                  (o.href === "/overlay-chat" || o.href === "/overlay-last-follower") ? (
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

                  {(() => {
                    const relativeHref = buildOverlayHref(o.href)
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

