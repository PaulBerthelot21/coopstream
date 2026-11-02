"use client"

import * as React from "react"
import Image from "next/image"
import { motion } from "framer-motion"

export function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.3a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.73a8.2 8.2 0 0 0 4.76 1.52V6.8a4.85 4.85 0 0 1-1-.11Z" />
    </svg>
  )
}

export const SOCIAL_ICON_BG = {
  tw: "linear-gradient(145deg, #9146ff66, #6441a544)",
  tt: "linear-gradient(145deg, #25f4ee44, #fe2c5544)",
  ig: "linear-gradient(145deg, #f58529aa, #dd2a7b99, #8134af99)",
  yt: "linear-gradient(145deg, #ff000066, #ff444433)",
} as const

export function SocialCard({
  label,
  handle,
  icon,
  delay,
  toneKey,
  marbleBg,
  accent,
  panelClassName,
}: {
  label: string
  handle: string
  icon: React.ReactNode
  delay: number
  toneKey: keyof typeof SOCIAL_ICON_BG
  marbleBg?: string
  accent: string
  panelClassName?: string
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
        className={panelClassName ?? "relative flex h-full w-full flex-col overflow-hidden rounded-[28px] border-[3px] border-[#2a1f5c] bg-[#1a1035]"}
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
          <div className={marbleBg ? "absolute inset-0 bg-[#0c061c]/45" : "absolute inset-0 bg-black/45"} />
          <div className={marbleBg ? "absolute inset-0 bg-gradient-to-r from-[#0c061c]/40 via-transparent to-[#0c061c]/25" : "absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/25"} />
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

