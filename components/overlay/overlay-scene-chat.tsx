"use client"

import * as React from "react"
import Image from "next/image"

import { OverlayCamera } from "@/components/overlay/overlay-camera"
import { OverlayTwitchChat } from "@/components/overlay/overlay-twitch-chat"
import { getOverlayPresetTheme, type OverlayPreset } from "@/lib/overlay/presets"

/** Épaisseur du cadre en % de la largeur viewport (~22px @ 1920) */
const SCREEN_FRAME = "1.15%"

/**
 * Layout en % du viewport — scale sur n’importe quelle résol 16:9 (1080p, 1440p…).
 */
const LAYOUT = {
  screen: {
    left: "3.2%",
    top: "14.1%",
    width: "74%",
    height: "67.4%",
  },
  right: {
    top: "14.1%",
    right: "1.7%",
    width: "18.5%",
    bottom: "3%",
  },
  brand: {
    left: "3.2%",
    top: "3.3%",
  },
} as const

export type SceneChatLayer = "preview" | "bg" | "frame" | "chat"

/**
 * Calques OBS (bas → haut), fond transparent :
 * 1. `bg` → 2. Firefox + Webcam → 3. `frame` → 4. `chat`
 *
 * Important : source navigateur = taille du canvas OBS (ex. 1920×1080).
 * Firefox / cam : même proportions en % que le cadre.
 */
export function OverlaySceneChat({
  channel,
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
  /** Fond pré-rendu (marbre + voiles CSS) — à utiliser aussi en image OBS */
  const bakedBg = "/overlays/lecalme-rebrand/scene-chat-bg.jpg"
  const isRebrand = preset === "lecalme-rebrand"

  const showBg = layer === "preview" || layer === "bg"
  const showFrames = layer === "preview" || layer === "frame"
  const showChat = layer === "preview" || layer === "chat"

  const outlineStyle: React.CSSProperties = {
    color: "transparent",
    WebkitTextStroke: "2px rgba(255,255,255,0.88)",
    textShadow: "0 6px 22px rgba(0,0,0,0.4)",
  }

  const screenFrame = (
    <div
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
        className="pointer-events-none absolute inset-0 rounded-[1.5vw] border-[0.16vw] border-[#2a1f5c]"
        style={{
          boxShadow:
            "0 0 0 0.08vw rgba(236,240,255,0.95), inset 0 0 0 1px rgba(236,240,255,0.28)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute rounded-[0.9vw]"
        style={{
          inset: SCREEN_FRAME,
          boxShadow: `inset 0 0 0 0.1vw ${accent}99, 0 0 0.8vw ${accent}18`,
        }}
      />
      <div
        className="absolute rounded-[0.75vw] bg-transparent"
        style={{ inset: SCREEN_FRAME }}
      />
    </div>
  )

  const rightColumn = (
    <div
      className="absolute z-20 flex flex-col gap-[1.2%]"
      style={{
        top: LAYOUT.right.top,
        right: LAYOUT.right.right,
        bottom: LAYOUT.right.bottom,
        width: LAYOUT.right.width,
      }}
    >
      {showFrames ? (
        <div className="w-full shrink-0">
          <OverlayCamera preset={preset} aspect="4/3" />
        </div>
      ) : (
        <div className="aspect-[4/3] w-full shrink-0 opacity-0" aria-hidden />
      )}

      {showChat ? (
        <div className="min-h-0 w-full flex-1">
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
        {showBg ? <div className="absolute inset-0 bg-[#020617]" /> : null}
        {showFrames ? (
          <div
            className="absolute rounded-2xl border-2 border-white/30"
            style={{ ...LAYOUT.screen }}
          />
        ) : null}
        {rightColumn}
      </div>
    )
  }

  return (
    <div className="pointer-events-none relative h-full w-full overflow-hidden bg-transparent">
      {showBg ? (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src={bakedBg}
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
            unoptimized
          />
        </div>
      ) : null}

      {(showFrames || showBg) && (
        <div
          className={`absolute z-20 ${showFrames ? "" : "opacity-0"}`}
          style={{ left: LAYOUT.brand.left, top: LAYOUT.brand.top }}
          aria-hidden={!showFrames}
        >
          <div className="flex flex-col font-black uppercase italic leading-[0.82] tracking-[-0.04em]">
            <span
              className="text-[clamp(1.2rem,2.6vmin,1.9rem)]"
              style={outlineStyle}
            >
              LE
            </span>
            <span
              className="-mt-0.5 ml-[8%] text-[clamp(1.6rem,3.6vmin,2.6rem)]"
              style={outlineStyle}
            >
              CALME
            </span>
          </div>
        </div>
      )}

      {showFrames ? screenFrame : null}
      {rightColumn}
    </div>
  )
}
