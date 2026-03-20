"use client"

import * as React from "react"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import Image from "next/image"

import type { Challenge, ChallengeId } from "@/lib/types/challenge"
import type { CoopStreamEvent } from "@/lib/types/events"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type RoomResponse = {
  challenges?: Challenge[]
  selectedChallengeId?: string | null
}

const POLL_MS = 2500

function safeCurrent(value: Challenge["current"]): number {
  if (typeof value === "number" && Number.isFinite(value)) return value
  return 0
}

export function StreamdeckChallengesPanel() {
  const [coopstreamKey, setCoopstreamKey] = React.useState<string>("")
  const [selectedChallengeId, setSelectedChallengeId] = React.useState<string | null>(null)
  const [challenges, setChallenges] = React.useState<Challenge[]>([])
  const [loading, setLoading] = React.useState(true)

  const loadKey = React.useCallback(async () => {
    try {
      const res = await fetch("/api/coopstream/rooms/me", { cache: "no-store" })
      if (!res.ok) return
      const data = (await res.json()) as { coopstreamKey?: string }
      setCoopstreamKey((data.coopstreamKey ?? "").trim())
    } catch {
      // ignore
    }
  }, [])

  const loadChallenges = React.useCallback(async () => {
    if (!coopstreamKey) return

    try {
      const res = await fetch(
        `/api/coopstream/rooms/${encodeURIComponent(coopstreamKey)}`,
        { cache: "no-store" },
      )
      if (!res.ok) {
        toast.error(`Impossible de charger les défis (HTTP ${res.status}).`)
        return
      }

      const data = (await res.json()) as RoomResponse
      setChallenges(data.challenges ?? [])
      setSelectedChallengeId(data.selectedChallengeId ?? null)
    } catch {
      toast.error("Impossible de charger les défis.")
    } finally {
      setLoading(false)
    }
  }, [coopstreamKey])

  React.useEffect(() => {
    void loadKey()
  }, [loadKey])

  React.useEffect(() => {
    if (!coopstreamKey) return
    setLoading(true)
    void loadChallenges()
    const id = window.setInterval(() => {
      void loadChallenges()
    }, POLL_MS)
    return () => window.clearInterval(id)
  }, [coopstreamKey, loadChallenges])

  const postEvent = React.useCallback(
    async (event: CoopStreamEvent) => {
      const res = await fetch(
        `/api/coopstream/rooms/${encodeURIComponent(coopstreamKey)}/events`,
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
        throw new Error(message)
      }
    },
    [coopstreamKey],
  )

  const increment = React.useCallback(
    async (id: ChallengeId) => {
      const c = challenges.find((x) => x.id === id)
      if (!c) return
      const next = safeCurrent(c.current) + 1

      // UX: optimistic update.
      setChallenges((prev) =>
        prev.map((x) => (x.id === id ? { ...x, current: next } : x)),
      )

      try {
        await postEvent({
          type: "UPDATE_PROGRESS",
          payload: { id, current: next },
        })
      } catch {
        toast.error("Impossible de synchroniser le défi.")
        await loadChallenges()
      }
    },
    [challenges, loadChallenges, postEvent],
  )

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-7">
      <div className="space-y-1">
        <h1 className="text-[22px] font-semibold tracking-tight">Streamdeck (défis)</h1>
        <p className="text-sm text-muted-foreground">
          Touchez +1 pour incrémenter le défi en cours.
        </p>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Défis</CardTitle>
          <CardDescription className="text-xs">
            {loading ? "Chargement..." : `${challenges.length} défi(s).`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 text-sm text-muted-foreground">Chargement...</div>
          ) : challenges.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">Aucun défi.</div>
          ) : (
            <div className="p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {challenges.map((c) => {
                const isSelected = c.id === selectedChallengeId
                return (
                  <div
                    key={c.id}
                    className={`flex flex-col gap-2 rounded-xl border border-border/60 px-3 py-2 ${
                      isSelected ? "bg-primary/10" : "bg-background/60"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {c.skinImageUrl ? (
                        <div className="relative h-8 w-8 overflow-hidden rounded-md bg-black/20 ring-1 ring-white/5 shrink-0">
                          <Image
                            src={c.skinImageUrl}
                            alt={c.title}
                            fill
                            sizes="32px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded-md bg-muted/40 ring-1 ring-border/60 shrink-0" />
                      )}

                      <div className="min-w-0">
                        <div className="truncate text-[12px] font-semibold leading-tight">
                          {c.title}
                        </div>
                        <div className="mt-1 text-[10px] text-muted-foreground">
                          {typeof c.target === "number"
                            ? `${safeCurrent(c.current)}/${c.target} ${c.unit ?? ""}`
                            : "—"}
                        </div>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      className="w-full gap-1.5"
                      disabled={typeof c.target !== "number"}
                      onClick={() => void increment(c.id)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      +1
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

