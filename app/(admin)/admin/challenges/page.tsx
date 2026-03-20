import { AdminPanel } from "@/components/admin/admin-panel"
import { AdminProtected } from "@/components/auth/admin-protected"

export default async function AdminChallengesPage() {
  return (
    <AdminProtected>
      <AdminPanel />
    </AdminProtected>
  )
}

