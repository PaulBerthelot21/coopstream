"use client"

import type { OverlayPresetTheme } from "@/lib/overlay/presets"
import { OverlayLecalmeAlertRebrand } from "@/components/overlay/overlay-lecalme-alert-rebrand"

type Props = {
  visual: OverlayPresetTheme
  displayName: string
  detail?: string
}

export function OverlayLastFollowerRebrand({
  visual,
  displayName,
  detail,
}: Props) {
  return (
    <OverlayLecalmeAlertRebrand
      visual={visual}
      title="Dernier follower"
      displayName={displayName}
      detail={detail}
      chibiUrl={visual.assets?.chibiUrl}
      animateChibi={false}
    />
  )
}
