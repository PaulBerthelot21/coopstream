"use client"

import * as React from "react"
import { toast } from "sonner"
import { Instagram, Save, Share2, Youtube } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type RoomResponse = {
  socialYoutube?: string | null
  socialTiktok?: string | null
  socialInstagram?: string | null
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.3a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.73a8.2 8.2 0 0 0 4.76 1.52V6.8a4.85 4.85 0 0 1-1-.11Z" />
    </svg>
  )
}

export function SocialLinksAdminPanel() {
  const [coopstreamKey, setCoopstreamKey] = React.useState("")
  const [youtube, setYoutube] = React.useState("")
  const [tiktok, setTiktok] = React.useState("")
  const [instagram, setInstagram] = React.useState("")
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    let alive = true
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/coopstream/rooms/me", { cache: "no-store" })
        if (!res.ok) return
        const data = (await res.json()) as { coopstreamKey?: string }
        if (!alive) return
        setCoopstreamKey(data.coopstreamKey?.trim() ?? "")
      } catch {
        // ignore
      } finally {
        if (alive) setLoading(false)
      }
    }
    void load()
    return () => {
      alive = false
    }
  }, [])

  React.useEffect(() => {
    if (!coopstreamKey) return
    let alive = true
    const load = async () => {
      try {
        const res = await fetch(
          `/api/coopstream/rooms/${encodeURIComponent(coopstreamKey)}`,
          { cache: "no-store" },
        )
        if (!res.ok) return
        const data = (await res.json()) as RoomResponse
        if (!alive) return
        setYoutube(data.socialYoutube ?? "")
        setTiktok(data.socialTiktok ?? "")
        setInstagram(data.socialInstagram ?? "")
      } catch {
        toast.error("Impossible de charger les réseaux.")
      }
    }
    void load()
    return () => {
      alive = false
    }
  }, [coopstreamKey])

  const save = React.useCallback(async () => {
    if (!coopstreamKey) return
    setSaving(true)
    try {
      const res = await fetch(
        `/api/coopstream/rooms/${encodeURIComponent(coopstreamKey)}/events`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "UPSERT_SOCIAL_LINKS",
            payload: {
              youtube: youtube.trim(),
              tiktok: tiktok.trim(),
              instagram: instagram.trim(),
            },
          }),
        },
      )
      if (!res.ok) {
        toast.error("Échec de la sauvegarde.")
        return
      }
      toast.success("Réseaux enregistrés")
    } catch {
      toast.error("Erreur réseau.")
    } finally {
      setSaving(false)
    }
  }, [coopstreamKey, youtube, tiktok, instagram])

  return (
    <Card className="bg-background/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-4 w-4 text-primary" />
          Réseaux sociaux
        </CardTitle>
        <CardDescription>
          Pseudos affichés sur l’intro (YouTube, TikTok, Instagram). Sans @ de
          préférence.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {loading ? (
          <div className="text-sm text-muted-foreground">Chargement…</div>
        ) : !coopstreamKey ? (
          <div className="text-sm text-muted-foreground">
            Connecte-toi pour obtenir une coopstreamKey.
          </div>
        ) : (
          <>
            <label className="flex flex-col gap-1.5">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Youtube className="h-3.5 w-3.5" /> YouTube
              </span>
              <Input
                value={youtube}
                onChange={(e) => setYoutube(e.target.value)}
                placeholder="lecalme"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <TikTokIcon className="h-3.5 w-3.5" /> TikTok
              </span>
              <Input
                value={tiktok}
                onChange={(e) => setTiktok(e.target.value)}
                placeholder="lecalme"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Instagram className="h-3.5 w-3.5" /> Instagram
              </span>
              <Input
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="lecalme"
              />
            </label>
          </>
        )}
      </CardContent>
      <CardFooter className="justify-end">
        <Button
          type="button"
          size="sm"
          onClick={() => void save()}
          disabled={!coopstreamKey || saving}
        >
          <Save className="mr-1.5 h-3.5 w-3.5" />
          {saving ? "…" : "Enregistrer"}
        </Button>
      </CardFooter>
    </Card>
  )
}
