"use client"

import * as React from "react"

type Cs2State = Record<string, unknown> & {
  map?: Record<string, unknown>
  player?: Record<string, unknown>
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "-"
}

function asNumber(value: unknown) {
  return typeof value === "number" ? value : 0
}

export function OverlayCs2Gsi() {
  const [state, setState] = React.useState<Cs2State | null>(null)
  const [connected, setConnected] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const es = new EventSource("http://localhost:3210/events")

    es.addEventListener("open", () => {
      setConnected(true)
      setError(null)
    })

    es.addEventListener("error", () => {
      setConnected(false)
      setError("Aucune connexion au listener GSI (port 3210).")
    })

    es.addEventListener("update", (event) => {
      try {
        const parsed = JSON.parse((event as MessageEvent).data) as Cs2State
        setState(parsed)
      } catch {
        // ignore malformed event
      }
    })

    return () => {
      es.close()
    }
  }, [])

  const map = asRecord(state?.map)
  const player = asRecord(state?.player)
  const matchStats = asRecord(player?.match_stats)
  const playerState = asRecord(player?.state)

  const mapName = asString(map?.name)
  const phase = asString(map?.phase)
  const round = asNumber(map?.round)
  const teamCt = asRecord(map?.team_ct)
  const teamT = asRecord(map?.team_t)
  const scoreCt = asNumber(teamCt?.score)
  const scoreT = asNumber(teamT?.score)

  const name = asString(player?.name)
  const team = asString(player?.team)
  const health = asNumber(playerState?.health)
  const armor = asNumber(playerState?.armor)
  const money = asNumber(playerState?.money)
  const kills = asNumber(matchStats?.kills)
  const deaths = asNumber(matchStats?.deaths)
  const assists = asNumber(matchStats?.assists)

  return (
    <div className="pointer-events-none flex h-dvh w-dvw items-start justify-end bg-transparent pr-6 pt-6">
      <div className="w-[420px] max-w-[45vw]">
        <div className="relative rounded-2xl bg-black/75 px-4 py-3 ring-1 ring-white/10 backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-10 rounded-t-2xl bg-gradient-to-r from-emerald-500/25 via-transparent to-cyan-500/25 blur-2xl" />

          <div className="relative mb-2 flex items-center justify-between">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/65">
              CS2 Live
            </div>
            <div
              className={
                "text-[10px] font-mono " +
                (connected ? "text-emerald-300" : "text-rose-300")
              }
            >
              {connected ? "connected" : "offline"}
            </div>
          </div>

          <div className="space-y-2 text-white">
            <div className="rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10">
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/60">Map</div>
              <div className="mt-1 text-sm font-semibold">{mapName}</div>
              <div className="mt-1 text-xs text-white/75">
                Phase: {phase} · Round: {round}
              </div>
              <div className="mt-1 text-xs text-white/85">
                CT {scoreCt} - {scoreT} T
              </div>
            </div>

            <div className="rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10">
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/60">Player</div>
              <div className="mt-1 text-sm font-semibold">{name}</div>
              <div className="mt-1 text-xs text-white/75">
                Team: {team} · HP {health} · Armor {armor}
              </div>
              <div className="mt-1 text-xs text-white/85">
                K/D/A: {kills}/{deaths}/{assists} · ${money}
              </div>
            </div>

            {error && <div className="text-xs text-rose-300">{error}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

