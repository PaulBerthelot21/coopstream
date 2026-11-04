import type { Metadata } from "next"
import { AdminProtected } from "@/components/auth/admin-protected"
import { BrandingEditor } from "@/components/branding/branding-editor"

export const metadata: Metadata = { title: "Bannières · Studio" }

export default function BannersPage() {
  return <AdminProtected><main className="mx-auto w-full max-w-[1680px] px-4 py-6 sm:px-6 lg:px-8"><BrandingEditor kind="banner" /></main></AdminProtected>
}
