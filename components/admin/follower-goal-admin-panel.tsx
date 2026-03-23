"use client"

import * as React from "react"
import { toast } from "sonner"

import { Save, Target, Trophy } from "lucide-react"

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
  followerGoalTitle?: string | null
  followerGoalTarget?: number | null
  followerGoalUnit?: string | null
}

export function FollowerGoalAdminPanel() {
  const [coopstreamKey, setCoopstreamKey] = React.useState<string>("")

  const [title, setTitle] = React.useState<string>("")
  const [target, setTarget] = React.useState<string>("")
  const [unit, setUnit] = React.useState<string>("followers")

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
        const key = data.coopstreamKey?.trim() ?? ""
        if (!alive) return
        setCoopstreamKey(key)
      } catch {
        // ignore (UI will remain blank)
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

    const loadGoal = async () => {
      try {
        const res = await fetch(
          `/api/coopstream/rooms/${encodeURIComponent(coopstreamKey)}`,
          { cache: "no-store" },
        )
        if (!res.ok) return
        const data = (await res.json()) as RoomResponse
        if (!alive) return

        setTitle(data.followerGoalTitle ?? "")

        const t = data.followerGoalTarget
        setTarget(typeof t === "number" && Number.isFinite(t) ? String(t) : "")

        setUnit(data.followerGoalUnit ?? "followers")
      } catch {
        toast.error("Impossible de charger l’objectif followers.")
      }
    }

    void loadGoal()
    return () => {
      alive = false
    }
  }, [coopstreamKey])

  const postEvent = React.useCallback(
    async (payload: { title: string; target: number; unit?: string }) => {
      if (!coopstreamKey) return
      setSaving(true)
      try {
        const res = await fetch(
          `/api/coopstream/rooms/${encodeURIComponent(coopstreamKey)}/events`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "UPSERT_FOLLOWER_GOAL",
              payload: {
                title: payload.title,
                target: payload.target,
                unit: payload.unit,
              },
            }),
          },
        )
        if (!res.ok) {
          toast.error("Impossible de sauvegarder l’objectif followers.")
          return
        }
        toast.success("Objectif followers sauvegardé.")
      } catch {
        toast.error("Impossible de sauvegarder l’objectif followers.")
      } finally {
        setSaving(false)
      }
    },
    [coopstreamKey],
  )

  function onSave() {
    const trimmedTitle = title.trim()
    const parsedTarget = target.trim() ? Number(target) : NaN

    if (!trimmedTitle) {
      toast.error("Titre requis.")
      return
    }
    if (!Number.isFinite(parsedTarget) || parsedTarget < 0) {
      toast.error("Nombre à atteindre invalide.")
      return
    }

    void postEvent({
      title: trimmedTitle,
      target: parsedTarget,
      unit: unit.trim() || undefined,
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-7">
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            Objectif followers
          </CardTitle>
          <CardDescription className="text-xs">
            Définis un texte (challenge) et un nombre de followers à atteindre pour l’overlay dédié.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="grid gap-2">
            <label className="text-xs text-muted-foreground">Texte à afficher (challenge)</label>
            <Input
              placeholder="Ex: Objectif 1 000 abonnés"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-[minmax(0,0.6fr)_minmax(0,0.4fr)]">
            <div className="grid gap-2">
              <label className="text-xs text-muted-foreground flex items-center gap-1">
                <Target className="h-3.5 w-3.5" />
                Nombre à atteindre
              </label>
              <Input
                placeholder="Ex: 1000"
                inputMode="numeric"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs text-muted-foreground">Unité</label>
              <Input
                placeholder="followers"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-end border-t border-border/60 bg-muted/40">
          <Button
            size="sm"
            className="gap-1.5"
            onClick={onSave}
            disabled={loading || saving || !coopstreamKey.trim()}
          >
            <Save className="h-3.5 w-3.5" />
            <span>{saving ? "Sauvegarde..." : "Sauvegarder"}</span>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

