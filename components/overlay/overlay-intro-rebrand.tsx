"use client"

import * as React from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Instagram, Youtube } from "lucide-react"
import { getOverlayPresetTheme } from "@/lib/overlay/presets"
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

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.3a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.73a8.2 8.2 0 0 0 4.76 1.52V6.8a4.85 4.85 0 0 1-1-.11Z" />
    </svg>
  )
}

type Socials = {
  youtube: string | null
  tiktok: string | null
  instagram: string | null
}

const SOCIAL_ICON_BG = {
  tt: "linear-gradient(145deg, #25f4ee44, #fe2c5544)",
  ig: "linear-gradient(145deg, #f58529aa, #dd2a7b99, #8134af99)",
  yt: "linear-gradient(145deg, #ff000066, #ff444433)",
} as const

function SocialCard({
  label,
  handle,
  icon,
  delay,
  toneKey,
  marbleBg,
  accent,
}: {
  label: string
  handle: string
  icon: React.ReactNode
  delay: number
  toneKey: keyof typeof SOCIAL_ICON_BG
  marbleBg?: string
  accent: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className="relative min-w-0 flex-1"
      style={{ minHeight: 108 }}
    >
      <div
        className="relative flex h-full w-full flex-col overflow-hidden rounded-[28px] border-[3px] border-[#2a1f5c] bg-[#1a1035]"
        style={{
          boxShadow:
            "0 0 0 1.5px rgba(236,240,255,0.95), 0 14px 36px rgba(0,0,0,0.55)",
        }}
      >
        {marbleBg ? (
          <Image
            src={marbleBg}
            alt=""
            fill
            className="object-cover"
            sizes="280px"
            unoptimized
          />
        ) : null}
        {/* Contenu clipé, bordure au-dessus du marbre */}
        <div className="pointer-events-none absolute inset-[3px] overflow-hidden rounded-[24px]">
          <div className="absolute inset-0 bg-[#0c061c]/45" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0c061c]/40 via-transparent to-[#0c061c]/25" />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[2] rounded-[28px]"
          style={{ boxShadow: "inset 0 0 0 1px rgba(236,240,255,0.35)" }}
        />

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 py-3.5 text-center">
          <div className="flex w-full items-center gap-2">
            <div
              className="h-[2px] min-w-[10px] flex-1 rounded-full"
              style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}` }}
            />
            <div
              className="shrink-0 text-[10px] font-black uppercase tracking-[0.18em] text-white"
              style={{ textShadow: "0 2px 10px rgba(0,0,0,0.85)" }}
            >
              {label}
            </div>
            <div
              className="h-[2px] min-w-[10px] flex-1 rounded-full"
              style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}` }}
            />
          </div>

          <div className="mt-2 flex w-full items-center justify-center gap-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white ring-1 ring-white/20 [&_svg]:h-5 [&_svg]:w-5"
              style={{ background: SOCIAL_ICON_BG[toneKey] }}
            >
              {icon}
            </div>
            <div
              className="max-w-[70%] truncate pb-0.5 text-left text-[18px] font-black leading-[1.2] tracking-tight text-white"
              style={{ textShadow: "0 3px 14px rgba(0,0,0,0.9)" }}
            >
              {handle}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
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

function TitleWord({
  children,
  from,
  meet,
  delay,
  className,
  style,
}: {
  children: React.ReactNode
  /** Direction d'entrée (négatif = gauche, positif = droite) */
  from: number
  /** Drift idle vers le partenaire (LE +, CALME -) */
  meet: number
  delay: number
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: from, filter: "blur(12px)" }}
      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={["w-fit will-change-transform", className].filter(Boolean).join(" ")}
      style={style}
    >
      <motion.span
        className="inline-block will-change-transform"
        animate={{ x: [0, meet] }}
        transition={{
          duration: 2.4,
          delay: delay + 0.75,
          repeat: Infinity,
          repeatType: "mirror",
          ease: [0.37, 0, 0.63, 1],
        }}
      >
        {children}
      </motion.span>
    </motion.div>
  )
}

export function OverlayIntroRebrand({
  startSeconds = 300,
  subtitle = "",
  coopstreamKey,
  channel,
}: {
  startSeconds?: number
  subtitle?: string
  coopstreamKey?: string
  channel?: string
}) {
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
    setRemaining(Math.max(0, startSeconds))
  }, [startSeconds])

  React.useEffect(() => {
    if (remaining <= 0) return
    const id = window.setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [remaining])

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
  const followProgress =
    goalTarget && followersTotal != null
      ? Math.min(100, Math.max(0, (followersTotal / Math.max(1, goalTarget)) * 100))
      : 0
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
    key: keyof typeof SOCIAL_ICON_BG
    label: string
    handle: string
    icon: React.ReactNode
  }>

  const outlineStyle: React.CSSProperties = {
    color: "transparent",
    WebkitTextStroke: "2.5px rgba(255,255,255,0.92)",
    textShadow: "0 8px 28px rgba(0,0,0,0.45)",
  }

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
        {/* Followers + dernier — une seule case DA rebrand */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.35 }}
          className="absolute right-6 top-6 z-20 w-[min(100%,380px)] sm:right-10 sm:top-8"
        >
          <div
            className="relative flex w-full flex-col overflow-hidden rounded-[28px] border-[3px] border-[#2a1f5c] bg-[#1a1035]"
            style={{
              boxShadow:
                "0 0 0 1.5px rgba(236,240,255,0.95), 0 14px 36px rgba(0,0,0,0.55)",
            }}
          >
            <div className="pointer-events-none absolute inset-[3px] overflow-hidden rounded-[24px]">
              {marbleBg ? (
                <Image
                  src={marbleBg}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="380px"
                  unoptimized
                />
              ) : null}
              <div className="absolute inset-0 bg-[#0c061c]/45" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0c061c]/40 via-transparent to-[#0c061c]/25" />
            </div>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-[2] rounded-[28px]"
              style={{ boxShadow: "inset 0 0 0 1px rgba(236,240,255,0.4)" }}
            />

            <div className="relative z-10 flex flex-col px-5 py-4">
              <div className="flex w-full items-center gap-2">
                <div
                  className="h-[2px] min-w-[12px] flex-1 rounded-full"
                  style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}` }}
                />
                <div
                  className="shrink-0 text-[10px] font-black uppercase tracking-[0.2em] text-white"
                  style={{ textShadow: "0 2px 10px rgba(0,0,0,0.85)" }}
                >
                  Followers
                </div>
                <div
                  className="h-[2px] min-w-[12px] flex-1 rounded-full"
                  style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}` }}
                />
              </div>

              <div className="mt-2">
                <div
                  className="font-black leading-none tracking-tight text-white"
                  style={{ textShadow: "0 3px 14px rgba(0,0,0,0.9)" }}
                >
                  <span className="text-[30px] tabular-nums">
                    {followersTotal != null ? followersTotal.toLocaleString("fr-FR") : "—"}
                  </span>
                  {goalTarget != null ? (
                    <>
                      <span className="mx-1 text-[18px] text-white/75">/</span>
                      <span className="text-[30px] tabular-nums">
                        {goalTarget.toLocaleString("fr-FR")}
                      </span>
                    </>
                  ) : null}
                </div>
                <div
                  className="mt-1 text-[9px] font-bold uppercase tracking-[0.28em] text-white/75"
                  style={{ textShadow: "0 1px 6px rgba(0,0,0,0.8)" }}
                >
                  {goalUnit}
                </div>
              </div>

              {goalTarget != null ? (
                <div className="mt-2.5 w-full">
                  <div className="h-[8px] w-full overflow-hidden rounded-full border border-white/85 bg-black/75">
                    <motion.div
                      className="h-full rounded-full"
                      animate={{ width: `${followProgress.toFixed(1)}%` }}
                      transition={{ type: "spring", stiffness: 120, damping: 20 }}
                      style={{ backgroundImage: visual.progressGradient }}
                    />
                  </div>
                </div>
              ) : null}

              <div
                className="mt-3 rounded-xl border px-3 py-2.5"
                style={{
                  borderColor: `${accent}66`,
                  background: `linear-gradient(135deg, ${accent}22, rgba(0,0,0,0.35))`,
                  boxShadow: `inset 0 0 0 1px ${accent}33, 0 0 18px ${accent}18`,
                }}
              >
                <div
                  className="text-[9px] font-bold uppercase tracking-[0.22em]"
                  style={{ color: accent, textShadow: "0 1px 6px rgba(0,0,0,0.8)" }}
                >
                  Dernier follower
                </div>
                <div
                  className="mt-1 truncate text-[22px] font-black leading-[1.15] tracking-tight text-white"
                  style={{
                    textShadow: `0 0 20px ${accent}55, 0 3px 14px rgba(0,0,0,0.9)`,
                  }}
                >
                  {lastFollower ?? "—"}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

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
              <div className="flex flex-col font-black uppercase italic leading-[0.82] tracking-[-0.04em]">
                <TitleWord
                  from={-160}
                  meet={22}
                  delay={0.05}
                  className="ml-[8%]"
                  style={{ ...outlineStyle, fontSize: "clamp(3.2rem, 11vmin, 8.5rem)" }}
                >
                  LE
                </TitleWord>
                <TitleWord
                  from={180}
                  meet={-26}
                  delay={0.05}
                  className="-mt-1 ml-[12%]"
                  style={{ ...outlineStyle, fontSize: "clamp(4rem, 14vmin, 10rem)" }}
                >
                  CALME
                </TitleWord>
                <TitleWord
                  from={-140}
                  meet={18}
                  delay={0.28}
                  className="mt-2 ml-[28%] text-white"
                  style={{
                    fontSize: "clamp(2rem, 6.5vmin, 4.4rem)",
                    textShadow: "0 4px 22px rgba(0,0,0,0.9)",
                  }}
                >
                  ARRIVE
                </TitleWord>
                <TitleWord
                  from={150}
                  meet={-20}
                  delay={0.28}
                  className="mt-3 ml-[16%] text-white sm:mt-4"
                  style={{
                    fontSize: "clamp(2rem, 6.5vmin, 4.4rem)",
                    textShadow: "0 4px 22px rgba(0,0,0,0.9)",
                  }}
                >
                  BIENTÔT
                </TitleWord>
              </div>
            </div>
          </div>

          {/* Compteur — droite */}
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
