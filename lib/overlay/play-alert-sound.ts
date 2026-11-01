/**
 * Son d’alerte overlay (follow / chat / …).
 * - Si `soundUrl` est fourni : joue ce fichier
 * - Sinon : petit chime Web Audio (aucun asset requis)
 * - `kind: "chat"` = ping plus court / discret
 */
export function playAlertSound(opts?: {
  soundUrl?: string | null
  volume?: number
  kind?: "alert" | "chat"
}) {
  if (typeof window === "undefined") return

  const kind = opts?.kind ?? "alert"
  const volume = Math.min(
    1,
    Math.max(0, opts?.volume ?? (kind === "chat" ? 0.35 : 0.7)),
  )
  const url = opts?.soundUrl?.trim()

  if (url) {
    try {
      const audio = new Audio(url)
      audio.volume = volume
      void audio.play().catch(() => {
        // Autoplay / fichier manquant : silencieux
      })
    } catch {
      // ignore
    }
    return
  }

  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!AudioCtx) return

    const ctx = new AudioCtx()
    const now = ctx.currentTime

    const master = ctx.createGain()
    master.gain.setValueAtTime(volume, now)
    master.connect(ctx.destination)

    const tone = (freq: number, start: number, dur: number, gain = 0.22) => {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(freq, start)
      g.gain.setValueAtTime(0.0001, start)
      g.gain.exponentialRampToValueAtTime(gain, start + 0.015)
      g.gain.exponentialRampToValueAtTime(0.0001, start + dur)
      osc.connect(g)
      g.connect(master)
      osc.start(start)
      osc.stop(start + dur + 0.02)
    }

    if (kind === "chat") {
      tone(1200, now, 0.09, 0.16)
    } else {
      // Deux notes montantes, style “ding” léger
      tone(740, now, 0.18, 0.2)
      tone(988, now + 0.12, 0.28, 0.18)
    }

    window.setTimeout(() => {
      void ctx.close().catch(() => {})
    }, kind === "chat" ? 250 : 700)
  } catch {
    // ignore
  }
}
