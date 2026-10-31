"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import type { OverlayPresetTheme } from "@/lib/overlay/presets"

type Props = {
  visual: OverlayPresetTheme
  title: string
  displayName: string
  chibiUrl?: string
}

export function OverlayLecalmeAlertRebrand({
  visual,
  title,
  displayName,
  chibiUrl,
}: Props) {
  const bg = visual.assets?.backgroundUrl
  const chibi = chibiUrl
  const accent = visual.accentColor ?? "#ffc4a8"

  return (
    <div className="relative h-[148px] w-full overflow-visible">
      <div className="absolute inset-y-[6%] left-[20%] right-0">
        <div
          className={visual.panelClassName}
          style={{
            boxShadow:
              "0 0 0 1.5px rgba(236,240,255,0.9), 0 14px 36px rgba(0,0,0,0.55)",
          }}
        >
          {bg ? (
            <Image
              src={bg}
              alt=""
              fill
              priority
              className="object-cover"
              sizes="420px"
            />
          ) : null}

          <div className="pointer-events-none absolute inset-0 bg-[#0c061c]/45" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0c061c]/55 via-transparent to-[#0c061c]/20" />

          <div className="relative z-10 flex h-full flex-col items-center justify-center pl-[22%] pr-5 py-3 text-center">
            <div className="flex w-full max-w-[96%] items-center gap-2.5">
              <div
                className="h-[2px] min-w-[14px] flex-1 rounded-full"
                style={{
                  backgroundColor: accent,
                  boxShadow: `0 0 8px ${accent}`,
                }}
              />
              <div
                className="shrink-0 text-[11px] font-black uppercase leading-none tracking-[0.2em] text-white"
                style={{ textShadow: "0 2px 10px rgba(0,0,0,0.85)" }}
              >
                {title}
              </div>
              <div
                className="h-[2px] min-w-[14px] flex-1 rounded-full"
                style={{
                  backgroundColor: accent,
                  boxShadow: `0 0 8px ${accent}`,
                }}
              />
            </div>

            <div
              className="mt-1.5 max-w-full truncate px-1 text-[26px] font-black leading-none tracking-tight text-white"
              style={{ textShadow: "0 3px 14px rgba(0,0,0,0.9)" }}
            >
              {displayName}
            </div>

            <div
              className="mt-2 text-[9px] font-semibold uppercase tracking-[0.38em] text-white/80"
              style={{ textShadow: "0 1px 6px rgba(0,0,0,0.75)" }}
            >
              LE CALME
            </div>
          </div>
        </div>
      </div>

      {chibi ? (
        <motion.div
          className="absolute -left-[2%] top-1/2 z-20 h-[118%] w-[46%] -translate-y-[52%]"
          initial={{ rotate: -8, scale: 0.92 }}
          animate={{ rotate: [-6, 4, -4, 2, 0], scale: 1 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <Image
            src={chibi}
            alt="Le Calme"
            fill
            priority
            className="object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.7)]"
            sizes="220px"
          />
        </motion.div>
      ) : null}
    </div>
  )
}
