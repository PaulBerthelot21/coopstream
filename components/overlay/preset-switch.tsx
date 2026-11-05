"use client"

import Image from "next/image"
import { LayoutDashboard } from "lucide-react"
import { useOverlayPreset } from "./overlay-preset-provider"

export function PresetSwitch() {
  const { preset, selectPreset } = useOverlayPreset()
  return <div role="group" aria-label="Preset actif" className="flex shrink-0 items-center gap-1 rounded-full border border-border/60 bg-muted/30 p-1">
    {(["default", "lecalme-rebrand"] as const).map(id => {
      const selected = preset === id
      const label = id === "default" ? "Par défaut" : "Bryan / LeCalme"
      return <button key={id} type="button" aria-pressed={selected} aria-label={label} title={label} onClick={() => selectPreset(id)} className={`flex h-7 items-center gap-1.5 rounded-full px-2 text-xs font-medium transition focus-visible:outline-2 focus-visible:outline-primary ${selected ? "bg-background text-foreground shadow-sm ring-1 ring-border" : "text-muted-foreground hover:bg-background/60 hover:text-foreground"}`}>
        {id === "default" ? <LayoutDashboard className="size-4" /> : <Image src="/overlays/lecalme-rebrand/chibi-goal.png" width={24} height={24} alt="" className="size-6 object-contain" />}
        <span className="hidden lg:inline">{label}</span>
      </button>
    })}
  </div>
}
