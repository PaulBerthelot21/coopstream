"use client"

import * as React from "react"
import { toast } from "sonner"
import { z } from "zod"
import {
  Download,
  Upload,
  Plus,
  Minus,
  Trash2,
  Target,
  Trophy,
  Copy,
} from "lucide-react"
import Image from "next/image"

import type { Challenge } from "@/lib/types/challenge"
import type { CoopStreamEvent } from "@/lib/types/events"
import { useCoopStreamStore } from "@/lib/store/coopstream"

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
import { useRouter } from "next/navigation"

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function AdminPanel({ initialKey }: { initialKey?: string }) {
  const router = useRouter()

  const challenges = useCoopStreamStore((s) => s.challenges)
  const selectedChallengeId = useCoopStreamStore((s) => s.selectedChallengeId)
  const upsertChallenge = useCoopStreamStore((s) => s.upsertChallenge)
  const deleteChallenge = useCoopStreamStore((s) => s.deleteChallenge)
  const selectChallenge = useCoopStreamStore((s) => s.selectChallenge)
  const updateProgress = useCoopStreamStore((s) => s.updateProgress)

  const [coopstreamKey, setCoopstreamKey] = React.useState<string>(
    initialKey?.trim() ?? "",
  )

  React.useEffect(() => {
    if (coopstreamKey) return

    const newKey = `${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 10)}`
    setCoopstreamKey(newKey)

    try {
      const url = new URL(window.location.href)
      url.searchParams.set("coopstreamKey", newKey)
      void router.replace(`${url.pathname}${url.search}`)
    } catch {
      // ignore
    }
  }, [coopstreamKey, router])

  // Hydrate admin state from DB so the UI matches the room.
  React.useEffect(() => {
    if (!coopstreamKey) return

    let alive = true
    const hydrate = async () => {
      try {
        const res = await fetch(
          `/api/coopstream/rooms/${encodeURIComponent(coopstreamKey)}`,
          { cache: "no-store" },
        )
        if (!res.ok) return

        const data = (await res.json()) as {
          challenges?: Challenge[]
          selectedChallengeId?: string | null
          lastRewardText?: string | null
          lastRewardAt?: number | null
        }

        if (!alive) return

        const map = Object.fromEntries(
          (data.challenges ?? []).map((c) => [c.id, c]),
        ) as Record<string, Challenge>

        useCoopStreamStore.setState((prev) => ({
          ...prev,
          challenges: map,
          selectedChallengeId: data.selectedChallengeId ?? null,
          lastRewardText: data.lastRewardText ?? null,
          lastRewardAt: data.lastRewardAt ?? null,
        }))
      } catch {
        // ignore
      }
    }

    void hydrate()
    return () => {
      alive = false
    }
  }, [coopstreamKey])

  const postEvent = React.useCallback(
    async (event: CoopStreamEvent) => {
      if (!coopstreamKey) return
      try {
        const res = await fetch(
          `/api/coopstream/rooms/${encodeURIComponent(coopstreamKey)}/events`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(event),
          },
        )

        if (!res.ok) {
          toast.error("Impossible de synchroniser l'overlay.")
        }
      } catch {
        toast.error("Impossible de synchroniser l'overlay.")
      }
    },
    [coopstreamKey],
  )

  const copyOverlayLink = React.useCallback(async () => {
    if (!coopstreamKey) {
      toast.error("Aucune coopstreamKey disponible pour copier le lien.")
      return
    }

    const url = `${window.location.origin}/overlay-defi-carrousel?coopstreamKey=${encodeURIComponent(
      coopstreamKey,
    )}`

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
        toast.success("Lien overlay copié")
        return
      }
    } catch {
      // fallback ci-dessous
    }

    try {
      const ta = document.createElement("textarea")
      ta.value = url
      ta.style.position = "fixed"
      ta.style.opacity = "0"
      ta.style.left = "-9999px"
      document.body.appendChild(ta)
      ta.focus()
      ta.select()
      document.execCommand("copy")
      ta.remove()
      toast.success("Lien overlay copié")
    } catch {
      toast.error("Impossible de copier le lien. Copie-le manuellement.")
    }
  }, [coopstreamKey])

  const [title, setTitle] = React.useState("")
  const [reward, setReward] = React.useState("")
  const [target, setTarget] = React.useState<string>("")
  const [unit, setUnit] = React.useState<string>("kills")
  const [skinImageUrl, setSkinImageUrl] = React.useState<string>("")

  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [editingTitle, setEditingTitle] = React.useState("")
  const [editingReward, setEditingReward] = React.useState("")
  const [editingTarget, setEditingTarget] = React.useState<string>("")
  const [editingUnit, setEditingUnit] = React.useState<string>("")
  const [editingSkinUrl, setEditingSkinUrl] = React.useState<string>("")

  const list = React.useMemo(() => {
    return Object.values(challenges).sort((a, b) => b.updatedAt - a.updatedAt)
  }, [challenges])

  const importInputRef = React.useRef<HTMLInputElement | null>(null)

  const challengeSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    reward: z.string().optional(),
    current: z.number().optional(),
    target: z.number().optional(),
    unit: z.string().optional(),
    skinImageUrl: z.string().optional(),
    updatedAt: z.number(),
  })

  const exportSchema = z.object({
    version: z.literal(1),
    exportedAt: z.number(),
    selectedChallengeId: z.string().nullable(),
    challenges: z.array(challengeSchema),
  })

  function exportChallenges() {
    const payload = {
      version: 1 as const,
      exportedAt: Date.now(),
      selectedChallengeId,
      challenges: Object.values(challenges),
    }

    const json = JSON.stringify(payload, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    const date = new Date().toISOString().slice(0, 10)
    a.download = `coopstream-defis-${date}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Export JSON téléchargé")
  }

  async function handleImportFile(file: File) {
    try {
      const text = await file.text()
      const parsed = exportSchema.parse(JSON.parse(text))

      const incoming = Object.fromEntries(
        parsed.challenges.map((c) => [c.id, c]),
      )
      const prevIds = new Set(Object.keys(challenges))
      const nextIds = new Set(Object.keys(incoming))

      // Remplace l'état local (persistance localStorage suivra automatiquement)
      useCoopStreamStore.setState((prev) => ({
        ...prev,
        challenges: incoming,
        selectedChallengeId: parsed.selectedChallengeId,
      }))

      // Sync overlay: supprimer ce qui n'existe plus, upsert ce qui existe, puis sélectionner
      for (const id of prevIds) {
        if (!nextIds.has(id)) {
          await postEvent({ type: "DELETE_CHALLENGE", payload: { id } })
        }
      }
      for (const c of parsed.challenges) {
        await postEvent({ type: "UPSERT_CHALLENGE", payload: { challenge: c } })
      }
      await postEvent({
        type: "SELECT_CHALLENGE",
        payload: { id: parsed.selectedChallengeId },
      })

      toast.success(`Import OK (${parsed.challenges.length} défis)`)
    } catch (e) {
      toast.error("Import impossible: JSON invalide ou format non reconnu")
    } finally {
      if (importInputRef.current) importInputRef.current.value = ""
    }
  }

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
      skinImageUrl: skinImageUrl.trim() || undefined,
      updatedAt: Date.now(),
    }

    upsertChallenge(challenge)
    void postEvent({ type: "UPSERT_CHALLENGE", payload: { challenge } })
    toast.success("Challenge créé")

    setTitle("")
    setReward("")
    setTarget("")
    setUnit("kills")
    setSkinImageUrl("")
  }

  function setCurrent(id: string | null) {
    selectChallenge(id)
    void postEvent({ type: "SELECT_CHALLENGE", payload: { id } })
  }

  function remove(id: string) {
    deleteChallenge(id)
    void postEvent({ type: "DELETE_CHALLENGE", payload: { id } })
    toast.success("Challenge supprimé")
  }

  async function removeAll() {
    const ids = Object.keys(challenges)
    if (ids.length === 0) {
      toast.info("Aucun défi à supprimer.")
      return
    }
    const ok = window.confirm(
      "Tu es sur le point de supprimer TOUS les défis (et de désélectionner le défi courant). Continuer ?",
    )
    if (!ok) return

    useCoopStreamStore.setState((prev) => ({
      ...prev,
      challenges: {},
      selectedChallengeId: null,
    }))

    for (const id of ids) {
      await postEvent({ type: "DELETE_CHALLENGE", payload: { id } })
    }
    await postEvent({ type: "SELECT_CHALLENGE", payload: { id: null } })

    toast.success("Tous les défis ont été supprimés.")
  }

  function startEdit(c: Challenge) {
    setEditingId(c.id)
    setEditingTitle(c.title)
    setEditingReward(c.reward ?? "")
    setEditingTarget(
      typeof c.target === "number" && !Number.isNaN(c.target)
        ? String(c.target)
        : "",
    )
    setEditingUnit(c.unit ?? "")
    setEditingSkinUrl(c.skinImageUrl ?? "")
  }

  function cancelEdit() {
    setEditingId(null)
    setEditingTitle("")
    setEditingReward("")
    setEditingTarget("")
    setEditingUnit("")
    setEditingSkinUrl("")
  }

  function saveEdit(original: Challenge) {
    const trimmedTitle = editingTitle.trim()
    if (!trimmedTitle) {
      toast.error("Titre requis")
      return
    }
    const updated: Challenge = {
      ...original,
      title: trimmedTitle,
      reward: editingReward.trim() || undefined,
      target: editingTarget
        ? Number(editingTarget) || original.target
        : undefined,
      unit: editingUnit.trim() || undefined,
      skinImageUrl: editingSkinUrl.trim() || undefined,
      updatedAt: Date.now(),
    }
    upsertChallenge(updated)
    void postEvent({ type: "UPSERT_CHALLENGE", payload: { challenge: updated } })
    cancelEdit()
    toast.success("Défi mis à jour")
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-7">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="flex items-center gap-2 text-[22px] font-semibold tracking-tight">
            <Target className="h-4 w-4 text-primary" />
            <span>Panneau de contrôle</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Gère les défis, la progression et les rewards de ta session en temps réel.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            ref={importInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void handleImportFile(file)
            }}
          />
          <Button variant="outline" size="sm" onClick={exportChallenges} className="gap-1.5">
            <Download className="h-3.5 w-3.5" />
            <span>Exporter JSON</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => importInputRef.current?.click()}
            className="gap-1.5"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Importer JSON</span>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => void removeAll()}
            className="gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Tout supprimer</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => void copyOverlayLink()}
            className="gap-1.5"
          >
            <Copy className="h-3.5 w-3.5" />
            <span>Copier lien overlay</span>
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
            <div className="flex items-center gap-2">
              <Input
                placeholder="Reward (ex: roulette, gage, 5€...)"
                value={reward}
                onChange={(e) => setReward(e.target.value)}
              />
              <Trophy className="hidden h-4 w-4 text-primary/70 sm:inline" />
            </div>
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
          <Input
            placeholder="URL image skin (optionnel)"
            value={skinImageUrl}
            onChange={(e) => setSkinImageUrl(e.target.value)}
          />
          {skinImageUrl && (
            <div className="flex items-center gap-3 rounded-xl border border-dashed border-border/60 bg-muted/40 p-3">
              <div className="relative h-16 w-32 overflow-hidden rounded-lg bg-black/40 ring-1 ring-border/60">
                <Image
                  src={skinImageUrl}
                  alt="Prévisualisation skin"
                  fill
                  className="object-contain"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Prévisualisation du skin lié au défi sélectionné.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-end border-t border-border/60 bg-muted/40">
          <Button size="sm" onClick={createChallenge} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            <span>Créer le défi</span>
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
            const isEditing = editingId === c.id
            return (
              <Card key={c.id} className={isSelected ? "ring-2 ring-ring" : undefined}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2">
                    {isEditing ? (
                      <Input
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        className="h-8 text-xs"
                      />
                    ) : (
                      <span className="truncate">{c.title}</span>
                    )}
                    <div className="flex items-center gap-2">
                      {isSelected && !isEditing && (
                        <span className="rounded-md bg-primary/10 px-2 py-1 text-xs text-primary">
                          Actuel
                        </span>
                      )}
                      {isEditing ? (
                        <>
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => cancelEdit()}
                            className="h-7 px-2 text-[10px]"
                          >
                            Annuler
                          </Button>
                          <Button
                            variant="secondary"
                            size="xs"
                            onClick={() => saveEdit(c)}
                            className="h-7 px-2 text-[10px]"
                          >
                            Enregistrer
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => startEdit(c)}
                          className="h-7 px-2 text-[10px]"
                        >
                          Modifier
                        </Button>
                      )}
                    </div>
                  </CardTitle>
                  <CardDescription className="space-y-2">
                    <div className="space-y-1">
                      {isEditing ? (
                        <div className="grid gap-2 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)]">
                          <Input
                            placeholder="Reward"
                            value={editingReward}
                            onChange={(e) => setEditingReward(e.target.value)}
                            className="h-8 text-xs"
                          />
                          <div className="flex gap-1">
                            <Input
                              placeholder="Objectif"
                              inputMode="numeric"
                              value={editingTarget}
                              onChange={(e) => setEditingTarget(e.target.value)}
                              className="h-8 text-xs"
                            />
                            <Input
                              placeholder="Unité"
                              value={editingUnit}
                              onChange={(e) => setEditingUnit(e.target.value)}
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          {c.reward && (
                            <div className="truncate">Reward: {c.reward}</div>
                          )}
                          {typeof c.target === "number" && (
                            <div className="text-xs text-muted-foreground">
                              Progression: {c.current ?? 0}/{c.target}{" "}
                              {c.unit ?? ""}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    {(c.skinImageUrl || isEditing) && (
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-20 overflow-hidden rounded-md bg-black/40 ring-1 ring-border/60">
                          <Image
                            src={isEditing ? editingSkinUrl || c.skinImageUrl || "" : c.skinImageUrl || ""}
                            alt={c.title}
                            fill
                            className="object-contain"
                          />
                        </div>
                        {isEditing ? (
                          <Input
                            placeholder="URL image skin"
                            value={editingSkinUrl}
                            onChange={(e) => setEditingSkinUrl(e.target.value)}
                            className="h-8 flex-1 text-[10px]"
                          />
                        ) : (
                          <div className="min-w-0 text-[10px] text-muted-foreground">
                            <div className="truncate">
                              Skin lié à ce défi (prévisualisation rapide).
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <Button
                      variant={isSelected ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setCurrent(isSelected ? null : c.id)}
                      className="gap-1.5"
                    >
                      {isSelected ? (
                        <>
                          <Minus className="h-3.5 w-3.5" />
                          <span>Déselectionner</span>
                        </>
                      ) : (
                        <>
                          <Plus className="h-3.5 w-3.5" />
                          <span>Sélectionner</span>
                        </>
                      )}
                    </Button>
                    {typeof c.target === "number" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const next = (c.current ?? 0) + 1
                            updateProgress(c.id, next)
                            void postEvent({
                              type: "UPDATE_PROGRESS",
                              payload: { id: c.id, current: next },
                            })
                          }}
                          className="px-2"
                          aria-label="+1"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const next = Math.max(0, (c.current ?? 0) - 1)
                            updateProgress(c.id, next)
                            void postEvent({
                              type: "UPDATE_PROGRESS",
                              payload: { id: c.id, current: next },
                            })
                          }}
                          className="px-2"
                          aria-label="-1"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => remove(c.id)}
                    className="gap-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Supprimer</span>
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

