"use client"

import * as React from "react"
import Image from "next/image"

import { AnimatedChatSignature } from "@/components/overlay/overlay-intro-title"
import { OverlayFollowerGoal } from "@/components/overlay/overlay-follower-goal"
import { OverlayCamera } from "@/components/overlay/overlay-camera"
import { OverlayTwitchChat } from "@/components/overlay/overlay-twitch-chat"
import { getOverlayPresetTheme, type OverlayPreset } from "@/lib/overlay/presets"

/** Fine bordure de marbre, ~8 px sur le cadre écran d’une scène 1080p. */
const SCREEN_FRAME = "0.6%"

/**
 * Layout en % du viewport — scale sur n’importe quelle résol 16:9 (1080p, 1440p…).
 */
const LAYOUT = {
  screen: {
    left: "3.2%",
    top: "14.1%",
    width: "74%",
    height: "61.4%",
  },
  right: {
    top: "14.1%",
    right: "1.7%",
    width: "18.5%",
    bottom: "3%",
  },
  goal: { left: "3.2%", bottom: "3%", width: "36%", height: "16%" },
  brand: {
    left: "3.2%",
    top: "3.3%",
  },
} as const

export type SceneChatLayer = "preview" | "frame" | "chat"

/**
 * Scène complète par défaut : fond, titre animé, cadres, chat et objectif.
 * Les anciennes sources frame/chat conservent leurs fonds transparents.
 * Les anciens liens frame/chat restent compatibles.
 *
 * Important : source navigateur = taille du canvas OBS (ex. 1920×1080).
 * Firefox / cam : même proportions en % que le cadre.
 */
export function OverlaySceneChat({
  channel,
  coopstreamKey,
  preset = "default",
  layer = "preview",
  chatSound = false,
  chatSoundUrl,
  chatSoundVolume = 0.55,
}: {
  channel?: string
  coopstreamKey?: string
  preset?: OverlayPreset
  layer?: SceneChatLayer
  chatSound?: boolean
  chatSoundUrl?: string
  chatSoundVolume?: number
}) {
  const visual = getOverlayPresetTheme(preset)
  const accent = visual.accentColor ?? "#ffc4a8"
  const marbleBg = visual.assets?.backgroundUrl
  const isRebrand = preset === "lecalme-rebrand"

  const showBackground = layer === "preview"
  const showFrames = layer === "preview" || layer === "frame"
  const showChat = layer === "preview" || layer === "chat"

  const screenFrame = (
    <div
      data-scene-screen
      className="absolute z-20"
      style={{
        left: LAYOUT.screen.left,
        top: LAYOUT.screen.top,
        width: LAYOUT.screen.width,
        height: LAYOUT.screen.height,
        filter: "drop-shadow(0 18px 40px rgba(0,0,0,0.55))",
      }}
    >
      <div
        className="absolute inset-0 rounded-[1.5vw]"
        style={{
          padding: SCREEN_FRAME,
          backgroundColor: "#1a1035",
          backgroundImage: marbleBg
            ? `linear-gradient(135deg, rgba(12,6,28,0.45), rgba(12,6,28,0.2) 40%, rgba(12,6,28,0.5)), url(${marbleBg})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          WebkitMaskImage: "linear-gradient(#000 0 0), linear-gradient(#000 0 0)",
          WebkitMaskClip: "content-box, border-box",
          WebkitMaskComposite: "xor",
          maskImage: "linear-gradient(#000 0 0), linear-gradient(#000 0 0)",
          maskClip: "content-box, border-box",
          maskComposite: "exclude",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[1.5vw] border-[0.1vw] border-[#2a1f5c]"
        style={{
          boxShadow:
            "0 0 0 0.08vw rgba(236,240,255,0.95), inset 0 0 0 1px rgba(236,240,255,0.28)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute rounded-[1.1vw]"
        style={{
          inset: SCREEN_FRAME,
          boxShadow: `inset 0 0 0 0.1vw ${accent}99, 0 0 0.8vw ${accent}18`,
        }}
      />
      <div
        className="absolute rounded-[1.05vw] bg-transparent"
        style={{ inset: SCREEN_FRAME }}
      />
    </div>
  )

  const rightColumn = (
    <div
      className="absolute z-20 flex flex-col"
      style={{
        top: LAYOUT.right.top,
        right: LAYOUT.right.right,
        bottom: LAYOUT.right.bottom,
        width: LAYOUT.right.width,
        gap: "clamp(16px, 1.6vw, 32px)",
      }}
    >
      {showFrames ? (
        <div data-scene-camera className="w-full shrink-0">
          <OverlayCamera preset={preset} aspect="4/3" />
        </div>
      ) : (
        <div className="aspect-[4/3] w-full shrink-0 opacity-0" aria-hidden />
      )}

      {showChat ? (
        <div data-scene-chat className="min-h-0 w-full flex-1">
          <OverlayTwitchChat
            channel={channel}
            preset={preset}
            maxMessages={22}
            sound={chatSound}
            soundUrl={chatSoundUrl}
            soundVolume={chatSoundVolume}
          />
        </div>
      ) : (
        <div className="min-h-0 w-full flex-1" aria-hidden />
      )}
    </div>
  )

  if (!isRebrand) {
    return (
      <div className="pointer-events-none relative h-full w-full overflow-hidden bg-transparent">
        {showBackground && <div className="absolute inset-0 bg-[#020617]" />}
        {showFrames ? (
          <div
            className="absolute rounded-2xl border-2 border-white/30"
            style={{ ...LAYOUT.screen }}
          />
        ) : null}
        {rightColumn}
        {showBackground && <div data-scene-goal className="absolute z-20" style={LAYOUT.goal}><OverlayFollowerGoal channel={channel} coopstreamKey={coopstreamKey} preset={preset} /></div>}
      </div>
    )
  }

  return (
    <div className="pointer-events-none relative h-full w-full overflow-hidden bg-transparent">
      {showBackground && <Image src="/overlays/lecalme-rebrand/scene-chat-bg.png" alt="" fill priority unoptimized sizes="100vw" className="object-cover" />}
      {showFrames && (
        <div
          className={`absolute z-20 ${showFrames ? "" : "opacity-0"}`}
          style={{ left: LAYOUT.brand.left, top: LAYOUT.brand.top }}
          aria-hidden={!showFrames}
        >
          <AnimatedChatSignature />
        </div>
      )}

      {showFrames ? screenFrame : null}
      {rightColumn}
      {showBackground && <div data-scene-goal className="absolute z-20" style={LAYOUT.goal}><OverlayFollowerGoal channel={channel} coopstreamKey={coopstreamKey} preset={preset} /></div>}
    </div>
  )
}
