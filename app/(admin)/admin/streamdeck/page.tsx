import type { Metadata } from "next"

import { AdminProtected } from "@/components/auth/admin-protected"
import { StreamdeckChallengesPanel } from "@/components/admin/streamdeck-challenges-panel"

export const metadata: Metadata = {
  title: "Streamdeck (défis)",
}

export default async function AdminStreamdeckPage() {
  return (
    <AdminProtected>
      <StreamdeckChallengesPanel />
    </AdminProtected>
  )
}

