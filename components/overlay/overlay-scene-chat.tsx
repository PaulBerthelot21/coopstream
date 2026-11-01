"use client"

import * as React from "react"
import Image from "next/image"
import { motion } from "framer-motion"

import { OverlayCamera } from "@/components/overlay/overlay-camera"
import { OverlayTwitchChat } from "@/components/overlay/overlay-twitch-chat"
import { getOverlayPresetTheme, type OverlayPreset } from "@/lib/overlay/presets"

const SCREEN_FRAME_PX = 22

/**
 * Scène Chat complète :
 * gauche = zone écran (game / capture), droite = cam en haut + chat en dessous (même largeur).
 * En OBS : pose game + webcam par-dessus les cadres respectifs.
 */
export function OverlaySceneChat({
  channel,
  preset = "default",
}: {
  channel?: string
  coopstreamKey?: string
  preset?: OverlayPreset
}) {
  const visual = getOverlayPresetTheme(preset)
  const accent = visual.accentColor ?? "#ffc4a8"
  const bg =
    visual.assets?.introBackgroundUrl ?? visual.assets?.backgroundUrl ?? null
  const marbleBg = visual.assets?.backgroundUrl
  const isRebrand = preset === "lecalme-rebrand"

  if (!isRebrand) {
    return (
      <div className="pointer-events-none relative flex h-full w-full gap-5 overflow-hidden bg-[#020617] p-8">
        <div className="absolute inset-0 bg-[radial-gradient(1000px_600px_at_10%_90%,rgba(76,29,149,0.28),transparent_60%),radial-gradient(800px_500px_at_90%_10%,rgba(14,165,233,0.16),transparent_55%)]" />
        <div className="relative min-w-0 flex-1 rounded-2xl border border-dashed border-white/20 bg-black/20" />
        <div className="relative z-10 flex w-[min(32vw,380px)] shrink-0 flex-col gap-4">
          <OverlayCamera preset={preset} aspect="4/3" />
          <div className="min-h-0 flex-1">
            <OverlayTwitchChat channel={channel} preset={preset} maxMessages={24} />
          </div>
        </div>
      </div>
    )
  }

  const outlineStyle: React.CSSProperties = {
    color: "transparent",
    WebkitTextStroke: "2px rgba(255,255,255,0.88)",
    textShadow: "0 6px 22px rgba(0,0,0,0.4)",
  }

  return (
    <div className="pointer-events-none relative h-full w-full overflow-hidden bg-black">
      {bg ? (
        <motion.div
          className="absolute inset-[-6%]"
          animate={{ scale: [1.03, 1.08, 1.03], x: [0, -10, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
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

      <div className="absolute inset-0 bg-[#0c061c]/28" />
      <div
        aria-hidden
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(100deg, rgba(6,3,14,0.12) 0%, transparent 30%, transparent 52%, rgba(8,4,18,0.4) 72%, rgba(4,2,10,0.7) 100%)",
        }}
      />

      <div className="relative z-10 flex h-full w-full flex-col px-8 py-7 sm:px-10 sm:py-8">
        {/* Brand */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="mb-4 flex shrink-0"
        >
          <div className="flex flex-col font-black uppercase italic leading-[0.82] tracking-[-0.04em]">
            <span className="text-[clamp(1.2rem,2.6vmin,1.9rem)]" style={outlineStyle}>
              LE
            </span>
            <span
              className="-mt-0.5 ml-[8%] text-[clamp(1.6rem,3.6vmin,2.6rem)]"
              style={outlineStyle}
            >
              CALME
            </span>
          </div>
        </motion.div>

        {/* Contenu : écran | cam+chat */}
        <div className="flex min-h-0 flex-1 gap-5">
          {/* Zone écran gauche */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15 }}
            className="relative min-w-0 flex-1"
            style={{ filter: "drop-shadow(0 18px 40px rgba(0,0,0,0.55))" }}
          >
            <div
              className="absolute inset-0 rounded-[28px]"
              style={{
                padding: SCREEN_FRAME_PX,
                backgroundColor: "#1a1035",
                backgroundImage: marbleBg
                  ? `linear-gradient(135deg, rgba(12,6,28,0.45), rgba(12,6,28,0.2) 40%, rgba(12,6,28,0.5)), url(${marbleBg})`
                  : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
                WebkitMaskImage:
                  "linear-gradient(#000 0 0), linear-gradient(#000 0 0)",
                WebkitMaskClip: "content-box, border-box",
                WebkitMaskComposite: "xor",
                maskImage: "linear-gradient(#000 0 0), linear-gradient(#000 0 0)",
                maskClip: "content-box, border-box",
                maskComposite: "exclude",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[28px] border-[3px] border-[#2a1f5c]"
              style={{
                boxShadow:
                  "0 0 0 1.5px rgba(236,240,255,0.95), inset 0 0 0 1px rgba(236,240,255,0.28)",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute rounded-[16px]"
              style={{
                inset: SCREEN_FRAME_PX - 1,
                boxShadow: `inset 0 0 0 2px ${accent}99, 0 0 16px ${accent}18`,
              }}
            />
            <div
              className="absolute rounded-[14px] bg-transparent"
              style={{ inset: SCREEN_FRAME_PX }}
            />
          </motion.div>

          {/* Colonne droite : cam + chat agrandi */}
          <div className="flex w-[min(36vw,480px)] shrink-0 flex-col gap-4">
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.22 }}
              className="w-full shrink-0"
            >
              <OverlayCamera preset={preset} aspect="4/3" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="min-h-0 w-full flex-1"
            >
              <OverlayTwitchChat
                channel={channel}
                preset={preset}
                maxMessages={22}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
