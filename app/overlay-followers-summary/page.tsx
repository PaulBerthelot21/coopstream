import { OverlayFollowersSummary } from "@/components/overlay/overlay-live-cards"
import { OverlayBodyMode } from "@/components/overlay/overlay-body-mode"
import { parseOverlayPreset } from "@/lib/overlay/presets"


type Params = { platform?: string; handle?: string; channel?: string; coopstreamKey?: string; preset?: string; text?: string; variant?: string; animate?: string; seconds?: string }

export default async function Page({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams
  return <div className="pointer-events-none flex min-h-dvh w-full items-start justify-start bg-transparent p-6"><OverlayBodyMode /><div className="w-[380px] min-h-[230px] max-w-full"><OverlayFollowersSummary channel={sp.channel} coopstreamKey={sp.coopstreamKey} preset={parseOverlayPreset(sp.preset)} /></div></div>
}
