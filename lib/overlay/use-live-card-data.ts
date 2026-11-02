"use client"

import * as React from "react"

type Room = { socialYoutube?: string | null; socialTiktok?: string | null; socialInstagram?: string | null; followerGoalTarget?: number | null; followerGoalUnit?: string | null }
type Follow = { total?: number; follower?: { displayName?: string; login?: string } | null }

export function useLiveCardData({ channel, coopstreamKey, followers = false }: { channel?: string; coopstreamKey?: string; followers?: boolean }) {
  const [room, setRoom] = React.useState<Room>({})
  const [follow, setFollow] = React.useState<Follow>({})
  const [status, setStatus] = React.useState("")
  React.useEffect(() => {
    let alive = true
    const controller = new AbortController()
    setRoom({})
    setFollow({})
    setStatus("Chargement…")
    const loadRoom = async () => {
      if (!coopstreamKey?.trim()) return
      try {
        const res = await fetch(`/api/coopstream/rooms/${encodeURIComponent(coopstreamKey.trim())}`, { cache: "no-store", signal: controller.signal })
        if (res.ok) { const data: Room = await res.json(); if (alive) setRoom(data) }
      } catch { /* Follower polling remains independent of room loading. */ }
    }
    const loadFollowers = async () => {
      if (!followers) { if (alive) setStatus(""); return }
      let storedChannel = ""
      try { storedChannel = localStorage.getItem("coopstream-twitch-channel") || "" } catch { /* OBS may block local storage. */ }
      const login = (channel?.trim() || storedChannel).replace(/^@/, "").replace(/^https?:\/\/(www\.)?twitch\.tv\//i, "").split("/")[0].toLowerCase()
      if (!login) { if (alive) setStatus("Renseigne ton canal Twitch dans le lien de la source."); return }
      const params = new URLSearchParams({ channel: login })
      if (coopstreamKey?.trim()) params.set("coopstreamKey", coopstreamKey.trim())
      try {
        const res = await fetch(`/api/twitch/last-follower?${params}`, { cache: "no-store", signal: controller.signal })
        if (!res.ok) throw new Error("unavailable")
        const data: Follow = await res.json()
        if (alive) { setFollow(data); setStatus("") }
      } catch { if (alive) setStatus("Données Twitch indisponibles · vérifie la connexion et le canal.") }
    }
    void loadRoom()
    void loadFollowers()
    const roomTimer = window.setInterval(() => void loadRoom(), 15000)
    const followerTimer = followers ? window.setInterval(() => void loadFollowers(), 15000) : undefined
    return () => { alive = false; controller.abort(); window.clearInterval(roomTimer); window.clearInterval(followerTimer) }
  }, [channel, coopstreamKey, followers])
  return { room, follow, status }
}
