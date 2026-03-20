import { AdminPanel } from "@/components/admin/admin-panel"
import { AdminProtected } from "@/components/auth/admin-protected"

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: Promise<{ coopstreamKey?: string }>
}) {
  const sp = searchParams ? await searchParams : undefined
  const initialKey =
    typeof sp?.coopstreamKey === "string" && sp.coopstreamKey.trim()
      ? sp.coopstreamKey.trim()
      : undefined

  return (
    <AdminProtected>
      <AdminPanel initialKey={initialKey} />
    </AdminProtected>
  )
}