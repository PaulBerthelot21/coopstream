"use client"

import * as React from "react"
import { motion } from "framer-motion"
import styles from "./brand-title.module.css"

function TitleWord({ children, from, meet, delay, className, style }: { children: React.ReactNode; from: number; meet: number; delay: number; className?: string; style?: React.CSSProperties }) {
  return <div className={`${styles.enter} w-fit ${className ?? ""}`} style={{ ...style, "--title-from": `${from}px`, "--title-drift": `${meet}px`, "--title-delay": `${delay}s`, "--title-idle-delay": `${delay + .75}s` } as React.CSSProperties}><span className={`${styles.drift} inline-block`}>{children}</span></div>
}

export function AnimatedChatSignature({ animated = true }: { animated?: boolean }) {
  const outline: React.CSSProperties = { color: "transparent", WebkitTextStroke: "2px rgba(255,255,255,.88)", textShadow: "0 6px 22px rgba(0,0,0,.4)" }
  return <div data-chat-signature className={`${animated ? "" : styles.still} flex flex-col font-black uppercase italic leading-[.82] tracking-[-.04em]`}>
    <TitleWord from={-40} meet={5.5} delay={.05} style={{ ...outline, fontSize: "clamp(1.2rem,2.6vmin,1.9rem)" }}>LE</TitleWord>
    <TitleWord from={45} meet={-6.5} delay={.05} className="-mt-0.5 ml-[8%]" style={{ ...outline, fontSize: "clamp(1.6rem,3.6vmin,2.6rem)" }}>CALME</TitleWord>
  </div>
}

export function OverlayIntroTitle({ variant = "intro", subtitle = "", animated = true }: { variant?: "intro" | "outro" | "pause"; subtitle?: string; animated?: boolean }) {
  const isOutro = variant === "outro"
  const isPause = variant === "pause"
  const outlineStyle: React.CSSProperties = { color: "transparent", WebkitTextStroke: "2.5px rgba(255,255,255,.92)", textShadow: "0 8px 28px rgba(0,0,0,.45)" }
  return <div data-intro-title className={animated ? undefined : styles.still}>
              <div className="flex flex-col font-black uppercase italic leading-[0.82] tracking-[-0.04em]">
                {isOutro ? (
                  <>
                    <TitleWord
                      from={-160}
                      meet={22}
                      delay={0.05}
                      className="ml-[8%]"
                      style={{ ...outlineStyle, fontSize: "clamp(3.2rem, 11vmin, 8.5rem)" }}
                    >
                      MERCI
                    </TitleWord>
                    <TitleWord
                      from={180}
                      meet={-26}
                      delay={0.05}
                      className="-mt-1 ml-[12%]"
                      style={{ ...outlineStyle, fontSize: "clamp(3.6rem, 12vmin, 9rem)" }}
                    >
                      D&apos;AVOIR
                    </TitleWord>
                    <TitleWord
                      from={-140}
                      meet={18}
                      delay={0.28}
                      className="mt-2 ml-[22%] text-white"
                      style={{
                        fontSize: "clamp(2.4rem, 8vmin, 5.2rem)",
                        textShadow: "0 4px 22px rgba(0,0,0,0.9)",
                      }}
                    >
                      SUIVI
                    </TitleWord>
                    {subtitle.trim() ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.55 }}
                        className="mt-4 ml-[12%] max-w-[90%] text-[clamp(1rem,2.2vmin,1.35rem)] font-semibold not-italic normal-case tracking-normal text-white/70"
                        style={{ textShadow: "0 2px 12px rgba(0,0,0,0.85)" }}
                      >
                        {subtitle.trim()}
                      </motion.div>
                    ) : null}
                  </>
                ) : isPause ? (
                  <>
                    <TitleWord
                      from={-160}
                      meet={22}
                      delay={0.05}
                      className="ml-[8%]"
                      style={{ ...outlineStyle, fontSize: "clamp(3.2rem, 11vmin, 8.5rem)" }}
                    >
                      PETITE
                    </TitleWord>
                    <TitleWord
                      from={180}
                      meet={-26}
                      delay={0.05}
                      className="-mt-1 ml-[10%]"
                      style={{ ...outlineStyle, fontSize: "clamp(4rem, 14vmin, 10rem)" }}
                    >
                      PAUSE
                    </TitleWord>
                    <TitleWord
                      from={-140}
                      meet={18}
                      delay={0.28}
                      className="mt-2 ml-[20%] text-white"
                      style={{
                        fontSize: "clamp(2rem, 6.5vmin, 4.4rem)",
                        textShadow: "0 4px 22px rgba(0,0,0,0.9)",
                      }}
                    >
                      ON REVIENT
                    </TitleWord>
                    <TitleWord
                      from={150}
                      meet={-20}
                      delay={0.28}
                      className="mt-3 ml-[28%] text-white sm:mt-4"
                      style={{
                        fontSize: "clamp(2rem, 6.5vmin, 4.4rem)",
                        textShadow: "0 4px 22px rgba(0,0,0,0.9)",
                      }}
                    >
                      BIENTÔT
                    </TitleWord>
                    {subtitle.trim() ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.55 }}
                        className="mt-4 ml-[12%] max-w-[90%] text-[clamp(1rem,2.2vmin,1.35rem)] font-semibold not-italic normal-case tracking-normal text-white/70"
                        style={{ textShadow: "0 2px 12px rgba(0,0,0,0.85)" }}
                      >
                        {subtitle.trim()}
                      </motion.div>
                    ) : null}
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>
  </div>
}
