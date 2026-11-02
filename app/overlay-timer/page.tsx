import { OverlayTimer } from "@/components/overlay/overlay-standalone-elements"
import { OverlayBodyMode } from "@/components/overlay/overlay-body-mode"
import { parseOverlayPreset } from "@/lib/overlay/presets"


type Params = { platform?: string; handle?: string; channel?: string; coopstreamKey?: string; preset?: string; text?: string; variant?: string; animate?: string; seconds?: string }

export default async function Page({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams
  const raw = Number(sp.seconds ?? 300)
  const seconds = Number.isFinite(raw) ? Math.min(86400, Math.max(0, Math.floor(raw))) : 300
  return <div className="pointer-events-none flex min-h-dvh w-full items-start justify-start bg-transparent p-6"><OverlayBodyMode /><div className="w-[400px] py-4 max-w-full"><OverlayTimer seconds={seconds} preset={parseOverlayPreset(sp.preset)} /></div></div>
}
