"use client"

import type { OverlayPresetTheme } from "@/lib/overlay/presets"
import { OverlayLecalmeAlertRebrand } from "@/components/overlay/overlay-lecalme-alert-rebrand"

type Props = {
  visual: OverlayPresetTheme
  displayName: string
}

export function OverlayNewSubRebrand({ visual, displayName }: Props) {
  return (
    <OverlayLecalmeAlertRebrand
      visual={visual}
      title="Nouveau sub"
      displayName={displayName}
      chibiUrl={visual.assets?.chibiSubUrl ?? visual.assets?.chibiUrl}
    />
  )
}
