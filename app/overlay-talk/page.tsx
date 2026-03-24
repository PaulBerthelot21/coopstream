import type { Metadata } from "next"

import { OverlayBodyMode } from "@/components/overlay/overlay-body-mode"
import { OverlayTalkChat } from "@/components/overlay/overlay-talk-chat"
import { parseOverlayPreset } from "@/lib/overlay/presets"

export const metadata: Metadata = {
  title: "Overlay Talk",
}

export default async function OverlayTalkPage({
  searchParams,
}: {
  searchParams?: Promise<{ channel?: string; preset?: string }>
}) {
  const sp = searchParams ? await searchParams : undefined
  const channelFromQuery =
    typeof sp?.channel === "string" && sp.channel.trim()
      ? sp.channel.trim()
      : undefined
  const presetFromQuery = parseOverlayPreset(sp?.preset)

  return (
    <div className="flex h-dvh w-dvw items-end justify-start bg-transparent pointer-events-none px-6 py-6">
      <OverlayBodyMode />
      <div className="w-[560px] max-w-[56vw] h-[44vh] max-h-[520px]">
        <OverlayTalkChat channel={channelFromQuery} preset={presetFromQuery} />
      </div>
    </div>
  )
}

