"use client"

import * as React from "react"
import Link from "next/link"
import { Copy } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
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

  React.useEffect(() => {
    try {
      setOrigin(window.location.origin)
    } catch {
      setOrigin("")
    }
  }, [])

  const copyOverlayLink = React.useCallback(
    async (href: string) => {
      const text = origin ? `${origin}${href}` : href
      try {
        await safeCopy(text)
        toast.success("Lien overlay copié")
      } catch {
        toast.error("Impossible de copier le lien. Copie-le manuellement.")
      }
    },
    [origin],
  )

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
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void copyOverlayLink(o.href)}
                      className="gap-1.5"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copier le lien</span>
                    </Button>
                    <Button asChild size="sm" variant="secondary">
                      <Link href={o.href}>Ouvrir l'overlay</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

