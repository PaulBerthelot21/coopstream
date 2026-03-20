import type { Metadata } from "next"

import { OverlayLastFollower } from "../../components/overlay/overlay-last-follower"

export const metadata: Metadata = {
  title: "Overlay Dernier follower",
}

export default async function OverlayLastFollowerPage({
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
      <div className="w-[360px] max-w-[40vw] min-h-[140px]">
        <OverlayLastFollower channel={channelFromQuery} />
      </div>
    </div>
  )
}
