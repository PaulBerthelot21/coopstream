"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import type { OverlayPresetTheme } from "@/lib/overlay/presets"

export function FollowersCard({ visual, followersTotal, goalTarget, goalUnit, lastFollower, status }: {
  visual: OverlayPresetTheme; followersTotal: number | null; goalTarget: number | null; goalUnit: string; lastFollower: string | null; status?: string
}) {
  const marbleBg = visual.assets?.backgroundUrl
  const accent = visual.accentColor ?? "var(--primary)"
  const followProgress = goalTarget && followersTotal != null ? Math.min(100, Math.max(0, followersTotal / goalTarget * 100)) : 0
  return (
          <div
            className={visual.panelClassName}
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
              <div className={marbleBg ? "absolute inset-0 bg-[#0c061c]/45" : "absolute inset-0 bg-black/45"} />
              <div className={marbleBg ? "absolute inset-0 bg-gradient-to-r from-[#0c061c]/40 via-transparent to-[#0c061c]/25" : "absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/25"} />
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
                  borderColor: `color-mix(in srgb, ${accent} 40%, transparent)`,
                  background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 13%, transparent), rgba(0,0,0,0.35))`,
                  boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${accent} 20%, transparent), 0 0 18px color-mix(in srgb, ${accent} 10%, transparent)`,
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
                    textShadow: `0 0 20px color-mix(in srgb, ${accent} 33%, transparent), 0 3px 14px rgba(0,0,0,0.9)`,
                  }}
                >
                  {lastFollower ?? "—"}
                </div>
              </div>
              {status && <p className="mt-2 text-xs text-white/60">{status}</p>}
            </div>
          </div>
  )
}
