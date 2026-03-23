import { FollowerGoalAdminPanel } from "@/components/admin/follower-goal-admin-panel"
import { AdminProtected } from "@/components/auth/admin-protected"

export default async function AdminFollowerGoalPage() {
  return (
    <AdminProtected>
      <FollowerGoalAdminPanel />
    </AdminProtected>
  )
}

