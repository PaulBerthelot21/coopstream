"use client"

import * as React from "react"

/**
 * Met l'application en mode "overlay OBS" :
 * - fond html/body totalement transparent
 * - désactive les background-images de thème (sinon OBS capte un "bleu nuit")
 */
export function OverlayBodyMode() {
  React.useEffect(() => {
    const html = document.documentElement
    const body = document.body
    if (!html || !body) return

    html.classList.add("overlay-body")
    body.classList.add("overlay-body")

    return () => {
      html.classList.remove("overlay-body")
      body.classList.remove("overlay-body")
    }
  }, [])

  return null
}

