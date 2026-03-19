import type { Metadata } from "next"

import { OverlayTwitchChat } from "../../components/overlay/overlay-twitch-chat"

export const metadata: Metadata = {
  title: "Overlay Chat",
}

export default async function OverlayChatPage({
  searchParams,
}: {
  searchParams?: Promise<{ channel?: string }>
}) {
  const sp = searchParams ? await searchParams : undefined

  const channelFromQuery =
    typeof sp?.channel === "string" && sp.channel.trim()
      ? sp.channel.trim()
      : undefined

  return (
    <div className="flex h-dvh w-dvw items-start justify-end bg-transparent pointer-events-none pr-6 pt-6">
      <div className="w-[420px] max-w-[45vw] h-[50vh] max-h-[540px]">
        <OverlayTwitchChat
          channel={channelFromQuery}
          // Kept for size; actual parsing/loading is handled in the component.
          maxMessages={32}
        />
      </div>
    </div>
  )
}

