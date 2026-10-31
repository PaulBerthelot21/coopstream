"use client"

import type { OverlayPresetTheme } from "@/lib/overlay/presets"
import { OverlayLecalmeAlertRebrand } from "@/components/overlay/overlay-lecalme-alert-rebrand"

type Props = {
  visual: OverlayPresetTheme
  displayName: string
}

export function OverlayNewRaidRebrand({ visual, displayName }: Props) {
  return (
    <OverlayLecalmeAlertRebrand
      visual={visual}
      title="Nouveau raid"
      displayName={displayName}
      chibiUrl={visual.assets?.chibiRaidUrl ?? visual.assets?.chibiUrl}
    />
  )
}
