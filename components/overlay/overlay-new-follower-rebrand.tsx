"use client"

import type { OverlayPresetTheme } from "@/lib/overlay/presets"
import { OverlayLecalmeAlertRebrand } from "@/components/overlay/overlay-lecalme-alert-rebrand"

type Props = {
  visual: OverlayPresetTheme
  displayName: string
}

export function OverlayNewFollowerRebrand({ visual, displayName }: Props) {
  return (
    <OverlayLecalmeAlertRebrand
      visual={visual}
      title="Nouveau follow"
      displayName={displayName}
      chibiUrl={visual.assets?.chibiFollowUrl ?? visual.assets?.chibiUrl}
    />
  )
}
