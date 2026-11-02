import { OverlayBrandTitle } from "@/components/overlay/overlay-standalone-elements"
import { OverlayBodyMode } from "@/components/overlay/overlay-body-mode"

export default async function Page({ searchParams }: { searchParams: Promise<{ animate?: string }> }) {
  const sp = await searchParams
  return <div className="pointer-events-none flex min-h-dvh w-full items-start justify-start bg-transparent p-6"><OverlayBodyMode /><div className="w-[600px] max-w-full py-4"><OverlayBrandTitle animated={sp.animate !== "0"} /></div></div>
}
