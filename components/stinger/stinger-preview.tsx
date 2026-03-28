"use client"

import * as React from "react"
import { motion } from "framer-motion"

import {
  type StingerVariantId,
  getStingerVariantMeta,
} from "@/lib/stinger-variants"

export const CHROMA = "#00ff00"
const STAGE_W = 1920
const STAGE_H = 1080

export function StingerPreview({
  variant,
  hideChrome = false,
  replayToken = 0,
}: {
  variant: StingerVariantId
  hideChrome?: boolean
  replayToken?: number
}) {
  const meta = getStingerVariantMeta(variant)
  const [scale, setScale] = React.useState(1)

  React.useEffect(() => {
    function fit() {
      const sw = window.innerWidth
      const sh = window.innerHeight
      const pad = hideChrome ? 0 : 48
      const s = Math.min((sw - pad) / STAGE_W, (sh - pad) / STAGE_H, 1)
      setScale(s > 0 ? s : 1)
    }
    fit()
    window.addEventListener("resize", fit)
    return () => window.removeEventListener("resize", fit)
  }, [hideChrome])

  return (
    <div
      className="flex items-center justify-center"
      style={{
        minHeight: hideChrome ? "100dvh" : undefined,
        width: "100%",
        backgroundColor: hideChrome ? CHROMA : undefined,
      }}
    >
      <div
        className="relative overflow-hidden shadow-2xl ring-1 ring-white/10"
        style={{
          width: STAGE_W,
          height: STAGE_H,
          backgroundColor: CHROMA,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        {variant === "diagonal" ? (
          <DiagonalWipe key={replayToken} durationSec={meta.durationMs / 1000} />
        ) : null}
        {variant === "vertical" ? (
          <VerticalWipe key={replayToken} durationSec={meta.durationMs / 1000} />
        ) : null}
        {variant === "iris" ? (
          <IrisWipe key={replayToken} durationSec={meta.durationMs / 1000} />
        ) : null}
        {variant === "glitch" ? (
          <GlitchWipe key={replayToken} durationSec={meta.durationMs / 1000} />
        ) : null}
      </div>
    </div>
  )
}

const easeSmooth: [number, number, number, number] = [0.22, 1, 0.36, 1]

function DiagonalWipe({ durationSec }: { durationSec: number }) {
  return (
    <>
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[220%] w-[90%] -translate-x-1/2 -translate-y-1/2"
        style={{ rotate: "-14deg" }}
        initial={{ x: "-140%" }}
        animate={{ x: "140%" }}
        transition={{ duration: durationSec, ease: easeSmooth }}
      >
        <div
          className="h-full w-full"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, transparent 8%, rgba(15,23,42,0.92) 18%, rgb(109,40,217) 38%, rgb(56,189,248) 52%, rgb(109,40,217) 66%, rgba(15,23,42,0.92) 82%, transparent 92%, transparent 100%)",
            boxShadow:
              "0 0 80px rgba(139,92,246,0.55), 0 0 120px rgba(56,189,248,0.35)",
          }}
        />
      </motion.div>
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[220%] w-[90%] -translate-x-1/2 -translate-y-1/2"
        style={{ rotate: "-14deg" }}
        initial={{ x: "-140%" }}
        animate={{ x: "140%" }}
        transition={{ duration: durationSec, ease: easeSmooth }}
      >
        <div
          className="h-full w-full opacity-90"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, transparent 34%, rgba(255,255,255,0.55) 49.2%, rgba(255,255,255,0.2) 50.2%, transparent 52%, transparent 100%)",
          }}
        />
      </motion.div>
    </>
  )
}

function VerticalWipe({ durationSec }: { durationSec: number }) {
  return (
    <>
      <motion.div
        className="pointer-events-none absolute inset-x-[-5%] top-0 h-[85%]"
        initial={{ y: "-110%" }}
        animate={{ y: "130%" }}
        transition={{ duration: durationSec, ease: easeSmooth }}
      >
        <div
          className="h-full w-full"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(15,23,42,0.5) 12%, rgb(76,29,149) 28%, rgb(56,189,248) 48%, rgb(109,40,217) 62%, rgba(15,23,42,0.75) 88%, transparent 100%)",
            boxShadow: "0 0 100px rgba(56,189,248,0.4), 0 40px 80px rgba(109,40,217,0.35)",
          }}
        />
      </motion.div>
      <motion.div
        className="pointer-events-none absolute inset-x-[-5%] top-0 h-[85%]"
        initial={{ y: "-110%" }}
        animate={{ y: "130%" }}
        transition={{ duration: durationSec, ease: easeSmooth }}
      >
        <div
          className="h-full w-full opacity-70"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, transparent 40%, rgba(255,255,255,0.45) 49.5%, rgba(255,255,255,0.12) 51%, transparent 60%, transparent 100%)",
          }}
        />
      </motion.div>
    </>
  )
}

function IrisWipe({ durationSec }: { durationSec: number }) {
  return (
    <motion.div
      className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[220%] max-w-none -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{
        background: `radial-gradient(circle closest-side, ${CHROMA} 0%, ${CHROMA} 38%, rgb(91,33,182) 40%, rgb(56,189,248) 49.5%, rgb(109,40,217) 51%, rgb(30,27,75) 56%, ${CHROMA} 58%, ${CHROMA} 100%)`,
        boxShadow: "inset 0 0 120px rgba(139,92,246,0.4)",
      }}
      initial={{ scale: 0.04 }}
      animate={{ scale: 1.35 }}
      transition={{ duration: durationSec, ease: easeSmooth }}
    />
  )
}

const GLITCH_STRIPS = 8

function GlitchWipe({ durationSec }: { durationSec: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col gap-[5px] py-2">
      {Array.from({ length: GLITCH_STRIPS }, (_, i) => {
        const delay = i * 0.018
        const hueShift = i % 2 === 0 ? 0 : 1
        return (
          <motion.div
            key={i}
            className="min-h-0 flex-1 overflow-hidden"
            style={{
              background:
                hueShift === 0
                  ? "linear-gradient(90deg, rgb(49,46,129) 0%, rgb(109,40,217) 40%, rgb(56,189,248) 100%)"
                  : "linear-gradient(90deg, rgb(30,27,75) 0%, rgb(56,189,248) 35%, rgb(91,33,182) 100%)",
            }}
            initial={{ x: 0, skewX: 0, opacity: 1 }}
            animate={{
              x: [0, 52, -44, 28, -16, 0],
              skewX: [0, 3, -4, 2, -1.5, 0],
              opacity: [1, 0.92, 1, 0.88, 0.96, 1],
            }}
            transition={{
              duration: durationSec,
              delay,
              ease: "easeInOut",
              times: [0, 0.18, 0.38, 0.55, 0.78, 1],
            }}
          />
        )
      })}
      <motion.div
        className="absolute inset-0 mix-blend-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.35, 0, 0.25, 0, 0.4, 0] }}
        transition={{ duration: durationSec, ease: "linear" }}
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.08) 2px, rgba(255,255,255,0.08) 4px)",
        }}
      />
    </div>
  )
}
