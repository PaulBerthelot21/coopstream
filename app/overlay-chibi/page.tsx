import { OverlayChibi } from "@/components/overlay/overlay-standalone-elements"
import { OverlayBodyMode } from "@/components/overlay/overlay-body-mode"
import { parseChibiVariant } from "@/lib/overlay/live-elements"

type Params = { platform?: string; handle?: string; channel?: string; coopstreamKey?: string; preset?: string; text?: string; variant?: string; animate?: string; seconds?: string }

export default async function Page({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams
  return <div className="pointer-events-none flex min-h-dvh w-full items-start justify-start bg-transparent p-6"><OverlayBodyMode /><div className="h-[340px] w-[320px] max-w-full"><OverlayChibi variant={parseChibiVariant(sp.variant)} animate={sp.animate !== "0"} /></div></div>
}
