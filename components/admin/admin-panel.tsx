"use client"

import * as React from "react"
import { toast } from "sonner"

import type { Challenge } from "@/lib/types/challenge"
import { publishEvent } from "@/lib/sync/broadcast"
import { useCoopStreamStore } from "@/lib/store/coopstream"
import { useBroadcastSync } from "@/lib/sync/useBroadcastSync"
import { useCoopStreamPersistence } from "@/lib/sync/useCoopStreamPersistence"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function AdminPanel() {
  useBroadcastSync()
  useCoopStreamPersistence()

  const challenges = useCoopStreamStore((s) => s.challenges)
  const selectedChallengeId = useCoopStreamStore((s) => s.selectedChallengeId)
  const upsertChallenge = useCoopStreamStore((s) => s.upsertChallenge)
  const deleteChallenge = useCoopStreamStore((s) => s.deleteChallenge)
  const selectChallenge = useCoopStreamStore((s) => s.selectChallenge)
  const updateProgress = useCoopStreamStore((s) => s.updateProgress)

  const [title, setTitle] = React.useState("")
  const [reward, setReward] = React.useState("")
  const [target, setTarget] = React.useState<string>("")
  const [unit, setUnit] = React.useState<string>("kills")

  const list = React.useMemo(() => {
    return Object.values(challenges).sort((a, b) => b.updatedAt - a.updatedAt)
  }, [challenges])

  function createChallenge() {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      toast.error("Titre requis")
      return
    }

    const challenge: Challenge = {
      id: newId(),
      title: trimmedTitle,
      reward: reward.trim() || undefined,
      current: 0,
      target: target ? Number(target) || undefined : undefined,
      unit: unit.trim() || undefined,
      updatedAt: Date.now(),
    }

    upsertChallenge(challenge)
    publishEvent({ type: "UPSERT_CHALLENGE", payload: { challenge } })
    toast.success("Challenge créé")

    setTitle("")
    setReward("")
    setTarget("")
    setUnit("kills")
  }

  function setCurrent(id: string | null) {
    selectChallenge(id)
    publishEvent({ type: "SELECT_CHALLENGE", payload: { id } })
  }

  function remove(id: string) {
    deleteChallenge(id)
    publishEvent({ type: "DELETE_CHALLENGE", payload: { id } })
    toast.success("Challenge supprimé")
  }

  function triggerReward() {
    const current = selectedChallengeId ? challenges[selectedChallengeId] : null
    const text =
      reward.trim() ||
      current?.reward ||
      (current ? `Récompense: ${current.title}` : "Récompense !")

    publishEvent({ type: "TRIGGER_REWARD", payload: { text } })
    toast.success("Reward envoyé à l’overlay")
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-7">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-[22px] font-semibold tracking-tight">
            Panneau de contrôle
          </h1>
          <p className="text-sm text-muted-foreground">
            Gère les défis, la progression et les rewards de ta session en temps réel.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrent(null)}>
            Désélectionner
          </Button>
          <Button size="sm" onClick={triggerReward}>
            Trigger reward
          </Button>
        </div>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Nouveau défi</CardTitle>
          <CardDescription className="text-xs">
            Définis un objectif clair, une unité de mesure et une reward. Tu pourras mettre à jour la progression en game.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <Input
              placeholder="Titre (ex: 15 kills à l’AWP)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Input
              placeholder="Reward (ex: roulette, gage, 5€...)"
              value={reward}
              onChange={(e) => setReward(e.target.value)}
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)]">
            <Input
              placeholder="Objectif (ex: 15)"
              inputMode="numeric"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
            <Input
              placeholder="Unité (ex: kills, headshots, rounds...)"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="justify-end border-t border-border/60 bg-muted/40">
          <Button size="sm" onClick={createChallenge}>
            Créer le défi
          </Button>
        </CardFooter>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        {list.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Aucun challenge</CardTitle>
              <CardDescription>Crée ton premier challenge ci-dessus.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          list.map((c) => {
            const isSelected = c.id === selectedChallengeId
            return (
              <Card key={c.id} className={isSelected ? "ring-2 ring-ring" : undefined}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2">
                    <span className="truncate">{c.title}</span>
                    {isSelected && (
                      <span className="rounded-md bg-primary/10 px-2 py-1 text-xs text-primary">
                        Actuel
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription className="space-y-1">
                    {c.reward && <div className="truncate">Reward: {c.reward}</div>}
                    {typeof c.target === "number" && (
                      <div className="text-xs text-muted-foreground">
                        Progression: {c.current ?? 0}/{c.target} {c.unit ?? ""}
                      </div>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <Button
                      variant={isSelected ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setCurrent(c.id)}
                    >
                      Sélectionner
                    </Button>
                    {typeof c.target === "number" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const next = (c.current ?? 0) + 1
                            updateProgress(c.id, next)
                            publishEvent({
                              type: "UPDATE_PROGRESS",
                              payload: { id: c.id, current: next },
                            })
                          }}
                        >
                          +1
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const next = Math.max(0, (c.current ?? 0) - 1)
                            updateProgress(c.id, next)
                            publishEvent({
                              type: "UPDATE_PROGRESS",
                              payload: { id: c.id, current: next },
                            })
                          }}
                        >
                          -1
                        </Button>
                      </>
                    )}
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => remove(c.id)}>
                    Supprimer
                  </Button>
                </CardFooter>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}

