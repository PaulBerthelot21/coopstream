"use client"

import { Instagram, Youtube, Twitch } from "lucide-react"
import { getOverlayPresetTheme, type OverlayPreset } from "@/lib/overlay/presets"
import { useLiveCardData } from "@/lib/overlay/use-live-card-data"
import { FollowersCard } from "./overlay-followers-card"
import { SocialCard, TikTokIcon } from "./overlay-social-card"

import type { SocialPlatform } from "@/lib/overlay/live-elements"

export function OverlaySocial({ platform, handle, coopstreamKey, preset }: { platform: SocialPlatform; handle?: string; coopstreamKey?: string; preset: OverlayPreset }) {
  const visual = getOverlayPresetTheme(preset)
  const { room } = useLiveCardData({ coopstreamKey })
  const saved = platform === "youtube" ? room.socialYoutube : platform === "tiktok" ? room.socialTiktok : platform === "instagram" ? room.socialInstagram : null
  const icons = { youtube: <Youtube />, tiktok: <TikTokIcon />, instagram: <Instagram />, twitch: <Twitch /> }
  const names = { youtube: "YouTube", tiktok: "TikTok", instagram: "Instagram", twitch: "Twitch" }
  return <SocialCard label={names[platform]} handle={handle?.trim() || saved?.trim() || "@toncompte"} icon={icons[platform]} delay={0} toneKey={platform === "youtube" ? "yt" : platform === "instagram" ? "ig" : platform === "tiktok" ? "tt" : "tw"} marbleBg={visual.assets?.backgroundUrl} accent={visual.accentColor ?? "var(--primary)"} panelClassName={visual.panelClassName} />
}

export function OverlayFollowersSummary({ channel, coopstreamKey, preset }: { channel?: string; coopstreamKey?: string; preset: OverlayPreset }) {
  const { room, follow, status } = useLiveCardData({ channel, coopstreamKey, followers: true })
  return <FollowersCard visual={getOverlayPresetTheme(preset)} followersTotal={typeof follow.total === "number" ? follow.total : null} goalTarget={typeof room.followerGoalTarget === "number" && room.followerGoalTarget > 0 ? room.followerGoalTarget : null} goalUnit={room.followerGoalUnit || "followers"} lastFollower={follow.follower?.displayName || follow.follower?.login || null} status={status} />
}
