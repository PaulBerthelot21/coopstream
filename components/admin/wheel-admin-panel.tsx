"use client"

import * as React from "react"
import { toast } from "sonner"
import { Check, Pencil, Plus, Trash2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type WheelItem = {
  id: string
  text: string
  createdAt: number
}

type WheelItemsEvent =
  | { type: "ADD"; payload: { text: string } }
  | { type: "DELETE"; payload: { id: string } }
  | { type: "UPDATE"; payload: { id: string; text: string } }

export function WheelAdminPanel() {
  const [coopstreamKey, setCoopstreamKey] = React.useState<string>("")
  const [items, setItems] = React.useState<WheelItem[]>([])
  const [text, setText] = React.useState<string>("")
  const [loading, setLoading] = React.useState<boolean>(true)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [editingText, setEditingText] = React.useState<string>("")

  React.useEffect(() => {
    let alive = true

    const loadKey = async () => {
      try {
        const res = await fetch("/api/coopstream/rooms/me", { cache: "no-store" })
        if (!res.ok) return
        const data = (await res.json()) as { coopstreamKey?: string }
        const key = data?.coopstreamKey?.trim() ?? ""
        if (!alive) return
        setCoopstreamKey(key)
      } catch {
        // ignore
      }
    }

    void loadKey()

    return () => {
      alive = false
    }
  }, [])

  const refresh = React.useCallback(async () => {
    if (!coopstreamKey) return
    try {
      setLoading(true)
      const res = await fetch(
        `/api/coopstream/rooms/${encodeURIComponent(coopstreamKey)}/wheel-items`,
        { cache: "no-store" },
      )
      if (!res.ok) {
        toast.error(`Impossible de charger la roue (HTTP ${res.status}).`)
        return
      }
      const data = (await res.json()) as { items?: WheelItem[] }
      setItems(data.items ?? [])
    } catch {
      toast.error("Impossible de charger la roue.")
    } finally {
      setLoading(false)
    }
  }, [coopstreamKey])

  React.useEffect(() => {
    void refresh()
  }, [refresh])

  const postEvent = React.useCallback(
    async (event: WheelItemsEvent) => {
      if (!coopstreamKey) return
      const res = await fetch(
        `/api/coopstream/rooms/${encodeURIComponent(coopstreamKey)}/wheel-items`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(event),
        },
      )

      if (!res.ok) {
        let message = `HTTP ${res.status}`
        try {
          const payload = await res.json()
          message = payload?.error ?? payload?.message ?? message
        } catch {
          // ignore
        }
        toast.error(`Impossible de synchroniser la roue : ${message}`)
        throw new Error(message)
      }
    },
    [coopstreamKey],
  )

  const onAdd = React.useCallback(async () => {
    const value = text.trim()
    if (!value) {
      toast.error("Texte requis")
      return
    }

    try {
      await postEvent({ type: "ADD", payload: { text: value } })
      setText("")
      await refresh()
      toast.success("Texte ajouté à la roue")
    } catch {
      // postEvent affiche déjà le toast error
    }
  }, [postEvent, refresh, text])

  const onDelete = React.useCallback(
    async (id: string) => {
      const ok = window.confirm("Supprimer ce texte de la roue ?")
      if (!ok) return

      try {
        await postEvent({ type: "DELETE", payload: { id } })
        await refresh()
        toast.success("Texte supprimé")
      } catch {
        // postEvent affiche déjà le toast error
      }
    },
    [postEvent, refresh],
  )

  const onUpdate = React.useCallback(async () => {
    if (!editingId) return
    const value = editingText.trim()
    if (!value) {
      toast.error("Texte requis")
      return
    }

    try {
      await postEvent({
        type: "UPDATE",
        payload: { id: editingId, text: value },
      })
      setEditingId(null)
      setEditingText("")
      await refresh()
      toast.success("Texte mis à jour")
    } catch {
      // postEvent affiche déjà le toast error
    }
  }, [editingId, editingText, postEvent, refresh])

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-7">
      <div className="space-y-1">
        <h1 className="text-[22px] font-semibold tracking-tight flex items-center gap-2">
          <span>Roue - Défis texte</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Ajoute des textes, puis recharge l'overlay pour lancer un tirage.
        </p>
        <div className="text-xs text-muted-foreground">
          coopstreamKey (wheel) :
          <span className="ml-2 font-mono text-[12px] text-foreground/80 break-all">
            {coopstreamKey || "—"}
          </span>
        </div>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Nouveau texte</CardTitle>
          <CardDescription className="text-xs">
            Un texte = un défi affiché lors du prochain chargement de l'overlay.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Ex: 5 kills sans AWP"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1"
              disabled={!coopstreamKey}
            />
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => void onAdd()}
              disabled={!coopstreamKey}
            >
              <Plus className="h-3.5 w-3.5" />
              Ajouter
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Liste des textes</CardTitle>
          <CardDescription className="text-xs">
            {items.length} texte{items.length > 1 ? "s" : ""} enregistrés.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Chargement…</div>
          ) : items.length === 0 ? (
            <div className="text-sm text-muted-foreground">Aucun texte pour l'instant.</div>
          ) : (
            <div className="space-y-2">
              {items.map((i) => (
                <div
                  key={i.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/60 px-3 py-2"
                >
                  {editingId === i.id ? (
                    <div className="min-w-0 flex-1 flex flex-col gap-2">
                      <Input
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="w-full"
                      />
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={() => void onUpdate()} className="gap-1.5">
                          <Check className="h-3.5 w-3.5" />
                          Enregistrer
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingId(null)
                            setEditingText("")
                          }}
                          className="gap-1.5"
                        >
                          <X className="h-3.5 w-3.5" />
                          Annuler
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3 min-w-0 w-full">
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold">{i.text}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(i.createdAt).toLocaleString("fr-FR")}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingId(i.id)
                            setEditingText(i.text)
                          }}
                          className="gap-1.5"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Modifier
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => void onDelete(i.id)}
                          className="shrink-0 gap-1.5"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

