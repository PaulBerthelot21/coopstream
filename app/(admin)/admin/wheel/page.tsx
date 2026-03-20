import { AdminProtected } from "@/components/auth/admin-protected"
import { WheelAdminPanel } from "@/components/admin/wheel-admin-panel"

export default async function AdminWheelPage() {
  return (
    <AdminProtected>
      <WheelAdminPanel />
    </AdminProtected>
  )
}

