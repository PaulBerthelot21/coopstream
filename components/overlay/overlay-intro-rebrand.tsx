"use client"

import * as React from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { SocialCard, TikTokIcon } from "@/components/overlay/overlay-social-card"
import { OverlayIntroTitle } from "@/components/overlay/overlay-intro-title"
import { FollowersCard } from "@/components/overlay/overlay-followers-card"
import { Instagram, Youtube } from "lucide-react"
import { getOverlayPresetTheme } from "@/lib/overlay/presets"
import { OverlayPlanning } from "@/components/overlay/overlay-planning"
import { OverlayTwitchChat } from "@/components/overlay/overlay-twitch-chat"

function normalizeChannel(input: string) {
  let ch = input.trim()
  ch = ch.replace(/^@/, "")
  ch = ch.replace(/^https?:\/\/(www\.)?twitch\.tv\//i, "")
  ch = ch.split("/")[0] ?? ""
  return ch.toLowerCase()
}

function formatClock(totalSeconds: number) {
  const safe = Math.max(0, totalSeconds)
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

type Socials = {
  youtube: string | null
  tiktok: string | null
  instagram: string | null
}

function FlyingChibi({
  src,
  size,
  delay,
  duration,
  flip,
}: {
  src: string
  size: number
  delay: number
  duration: number
  flip: boolean
}) {
  return (
    <motion.div
      className="pointer-events-none relative z-[5]"
      style={{ width: size, height: size, maxWidth: "100%" }}
      initial={{ opacity: 0, y: 24, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        animate={{
          y: [0, -16],
          x: [0, flip ? 12 : -12],
          rotate: [flip ? 4 : -4, flip ? -3 : 3],
        }}
        transition={{
          duration,
          delay: delay + 0.4,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      >
        <Image
          src={src}
          alt=""
          width={size}
          height={size}
          className={`h-full w-full object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.55)] ${flip ? "-scale-x-100" : ""}`}
          unoptimized
        />
      </motion.div>
    </motion.div>
  )
}

export function OverlayIntroRebrand({
  startSeconds = 300,
  subtitle = "",
  coopstreamKey,
  channel,
  variant = "intro",
}: {
  startSeconds?: number
  subtitle?: string
  coopstreamKey?: string
  channel?: string
  /** `outro` = planning à la place du minuteur ; `pause` = sans minuteur ni planning */
  variant?: "intro" | "outro" | "pause"
}) {
  const isOutro = variant === "outro"
  const isPause = variant === "pause"
  const showPlanning = isOutro
  const hideTimer = isOutro || isPause
  const visual = getOverlayPresetTheme("lecalme-rebrand")
  const accent = visual.accentColor ?? "#ffc4a8"
  const bg = visual.assets?.introBackgroundUrl ?? visual.assets?.backgroundUrl
  const chibiSrc = {
    goal: visual.assets?.chibiUrl ?? "/overlays/lecalme-rebrand/chibi-goal.png",
    follow: visual.assets?.chibiFollowUrl ?? "/overlays/lecalme-rebrand/chibi-follow.png",
    sub: visual.assets?.chibiSubUrl ?? "/overlays/lecalme-rebrand/chibi-sub.png",
    raid: visual.assets?.chibiRaidUrl ?? "/overlays/lecalme-rebrand/chibi-raid.png",
  }

  const [remaining, setRemaining] = React.useState(Math.max(0, startSeconds))
  const [socials, setSocials] = React.useState<Socials>({
    youtube: null,
    tiktok: null,
    instagram: null,
  })
  const [channelNormalized, setChannelNormalized] = React.useState("")
  const [followersTotal, setFollowersTotal] = React.useState<number | null>(null)
  const [lastFollower, setLastFollower] = React.useState<string | null>(null)
  const [goalTarget, setGoalTarget] = React.useState<number | null>(null)
  const [goalUnit, setGoalUnit] = React.useState("followers")

  React.useEffect(() => {
    if (hideTimer) return
    setRemaining(Math.max(0, startSeconds))
  }, [startSeconds, hideTimer])

  React.useEffect(() => {
    if (hideTimer) return
    if (remaining <= 0) return
    const id = window.setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [remaining, hideTimer])

  React.useEffect(() => {
    const STORAGE_KEY = "coopstream-twitch-channel"
    const fallback = "anthemtv_"
    const apply = () => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        setChannelNormalized(normalizeChannel(channel?.trim() || raw || fallback))
      } catch {
        setChannelNormalized(normalizeChannel(channel?.trim() || fallback))
      }
    }
    if (channel?.trim()) {
      setChannelNormalized(normalizeChannel(channel))
      return
    }
    apply()
    const id = window.setInterval(apply, 2000)
    return () => window.clearInterval(id)
  }, [channel])

  React.useEffect(() => {
    if (!channelNormalized) return
    let alive = true
    const load = async () => {
      try {
        const qp = new URLSearchParams({ channel: channelNormalized })
        const key = coopstreamKey?.trim()
        if (key) qp.set("coopstreamKey", key)
        const res = await fetch(`/api/twitch/last-follower?${qp.toString()}`, {
          cache: "no-store",
        })
        if (!res.ok || !alive) return
        const data = (await res.json()) as {
          total?: number
          follower?: { displayName?: string; login?: string } | null
        }
        if (!alive) return
        setFollowersTotal(typeof data.total === "number" ? data.total : null)
        const name = data.follower?.displayName || data.follower?.login || null
        setLastFollower(name)
      } catch {
        // ignore
      }
    }
    void load()
    const id = window.setInterval(() => void load(), 15_000)
    return () => {
      alive = false
      window.clearInterval(id)
    }
  }, [channelNormalized, coopstreamKey])

  React.useEffect(() => {
    const key = coopstreamKey?.trim()
    if (!key) return
    let alive = true
    const load = async () => {
      try {
        const res = await fetch(`/api/coopstream/rooms/${encodeURIComponent(key)}`, {
          cache: "no-store",
        })
        if (!res.ok) return
        const data = (await res.json()) as {
          socialYoutube?: string | null
          socialTiktok?: string | null
          socialInstagram?: string | null
          followerGoalTarget?: number | null
          followerGoalUnit?: string | null
        }
        if (!alive) return
        setSocials({
          youtube: data.socialYoutube?.trim() || null,
          tiktok: data.socialTiktok?.trim() || null,
          instagram: data.socialInstagram?.trim() || null,
        })
        setGoalTarget(
          typeof data.followerGoalTarget === "number" && Number.isFinite(data.followerGoalTarget)
            ? data.followerGoalTarget
            : null,
        )
        setGoalUnit(data.followerGoalUnit?.trim() || "followers")
      } catch {
        // ignore
      }
    }
    void load()
    const id = window.setInterval(() => void load(), 8000)
    return () => {
      alive = false
      window.clearInterval(id)
    }
  }, [coopstreamKey])

  const total = Math.max(1, startSeconds)
  const progress = Math.min(100, Math.max(0, ((total - remaining) / total) * 100))
  const marbleBg = visual.assets?.backgroundUrl
  const socialCards = [
    socials.youtube
      ? {
          key: "yt" as const,
          label: "YouTube",
          handle: socials.youtube,
          icon: <Youtube className="h-5 w-5" />,
        }
      : null,
    socials.instagram
      ? {
          key: "ig" as const,
          label: "Instagram",
          handle: socials.instagram,
          icon: <Instagram className="h-5 w-5" />,
        }
      : null,
    socials.tiktok
      ? {
          key: "tt" as const,
          label: "TikTok",
          handle: socials.tiktok,
          icon: <TikTokIcon className="h-5 w-5" />,
        }
      : null,
  ].filter(Boolean) as Array<{
    key: "yt" | "ig" | "tt"
    label: string
    handle: string
    icon: React.ReactNode
  }>


  return (
    <div className="pointer-events-none relative h-full w-full overflow-hidden bg-black">
      {/* Marbre plein écran */}
      {bg ? (
        <motion.div
          className="absolute inset-[-6%]"
          animate={{ scale: [1.04, 1.1, 1.04], x: [0, -12, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src={bg}
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
            unoptimized
          />
        </motion.div>
      ) : (
        <div className="absolute inset-0 bg-[#1a0f35]" />
      )}

      <div className="absolute inset-0 bg-[#0c061c]/30" />

      {/* Voile diagonal doux à droite (pas un noir plat) */}
      <div
        aria-hidden
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(105deg, transparent 0%, transparent 34%, rgba(8,4,18,0.35) 42%, rgba(6,3,14,0.72) 55%, rgba(4,2,10,0.88) 100%)",
        }}
      />

      {/* Contenu */}
      <div className="relative z-10 flex h-full w-full flex-col px-7 py-8 sm:px-12 sm:py-10">
        {/* Droite : followers (+ planning en outro, espaces égaux jusqu’aux réseaux) */}
        <div
          className={
            showPlanning
              ? "absolute right-6 top-6 bottom-[10.5rem] z-20 flex w-[min(100%,380px)] flex-col sm:right-10 sm:top-8 sm:bottom-[12rem]"
              : "absolute right-6 top-6 z-20 w-[min(100%,380px)] sm:right-10 sm:top-8"
          }
        >
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.35 }}
          className="w-full shrink-0"
        >
          <FollowersCard visual={visual} followersTotal={followersTotal} goalTarget={goalTarget} goalUnit={goalUnit} lastFollower={lastFollower} />
        </motion.div>

        {showPlanning ? (
          <>
            <div className="min-h-3 flex-1" aria-hidden />
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.5 }}
              className="w-full shrink-0"
            >
              <OverlayPlanning
                channel={channelNormalized || channel}
                coopstreamKey={coopstreamKey}
                preset="lecalme-rebrand"
                limit={3}
              />
            </motion.div>
            <div className="min-h-3 flex-1" aria-hidden />
          </>
        ) : null}
        </div>

        {/* Gauche tête · milieu titre · droite compteur */}
        <div className="relative flex flex-1 items-center gap-4 pt-2 sm:gap-6">
          {/* Tête — gauche */}
          <div className="relative z-[5] flex w-[28%] shrink-0 items-center justify-center">
            <FlyingChibi
              src={chibiSrc.goal}
              size={420}
              delay={0.2}
              duration={8.2}
              flip={false}
            />
          </div>

          {/* Titre — milieu */}
          <div className="flex min-w-0 flex-1 justify-center px-2">
            <div className="w-full max-w-[560px]">
              <OverlayIntroTitle variant={variant} subtitle={subtitle} />
            </div>
          </div>

          {/* Compteur — droite (intro only) ; spacer pour garder le titre centré sans minuteur */}
          {hideTimer ? (
            <div className="w-[22%] shrink-0" aria-hidden />
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.45 }}
              className="flex w-[22%] shrink-0 flex-col items-center justify-center"
            >
              <motion.div
                key={remaining}
                initial={{ opacity: 0.55 }}
                animate={{ opacity: 1 }}
                className="font-black tabular-nums leading-none tracking-tight text-white"
                style={{
                  fontSize: "clamp(3rem, 6.5vmin + 0.4rem, 5rem)",
                  textShadow: `0 0 28px ${accent}55, 0 4px 22px rgba(0,0,0,0.9)`,
                }}
              >
                {formatClock(remaining)}
              </motion.div>
              <div className="mt-2 h-[3px] w-[min(100%,160px)] overflow-hidden rounded-full bg-white/15">
                <motion.div
                  className="h-full rounded-full"
                  animate={{ width: `${progress.toFixed(1)}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  style={{ backgroundColor: accent }}
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* Petit chat — bas gauche, absolute (ne décale pas tête / titre / réseaux) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="absolute bottom-10 left-7 z-20 h-[200px] w-[min(100%,480px)] sm:bottom-14 sm:left-10 sm:h-[220px] sm:w-[520px]"
        >
          <OverlayTwitchChat
            channel={channelNormalized || channel}
            preset="lecalme-rebrand"
            maxMessages={12}
            sound={false}
          />
        </motion.div>

        {/* Réseaux — bas droite (inchangé) */}
        <div className="mb-12 ml-auto w-full max-w-[64%] sm:mb-16 sm:max-w-[58%]">
          {socialCards.length > 0 ? (
            <div className="flex w-full flex-nowrap items-stretch gap-3">
              {socialCards.map((card, i) => (
                  <SocialCard
                    key={card.key}
                    label={card.label}
                    handle={card.handle}
                    icon={card.icon}
                    delay={0.85 + i * 0.1}
                    toneKey={card.key}
                    marbleBg={marbleBg}
                    accent={accent}
                  />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 }}
              className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-xs text-white/45"
            >
              Configure les réseaux dans /admin/social
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
