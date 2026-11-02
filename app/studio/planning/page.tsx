import type { Metadata } from "next"
import { PlanningEditor } from "@/components/planning/planning-editor"
import { AdminProtected } from "@/components/auth/admin-protected"

export const metadata: Metadata = { title: "Planning · Studio" }

export default function PlanningPage() {
  return <AdminProtected><main className="mx-auto w-full max-w-[1680px] px-4 py-6 sm:px-6 lg:px-8"><PlanningEditor /></main></AdminProtected>
}
