import type { Metadata } from "next"

import { OverlayNewFollowerToast } from "@/components/overlay/overlay-new-follower-toast"

export const metadata: Metadata = {
  title: "Overlay Nouveau follower",
}

export default async function OverlayNewFollowerPage({
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
      <div className="w-[420px] max-w-[45vw] h-[40vh] max-h-[380px]">
        <OverlayNewFollowerToast channel={channelFromQuery} />
      </div>
    </div>
  )
}

