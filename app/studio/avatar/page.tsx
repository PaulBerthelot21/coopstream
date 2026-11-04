import type { Metadata } from "next"
import { AdminProtected } from "@/components/auth/admin-protected"
import { BrandingEditor } from "@/components/branding/branding-editor"

export const metadata: Metadata = { title: "Photo de profil · Studio" }

export default function AvatarPage() {
  return <AdminProtected><main className="mx-auto w-full max-w-[1680px] px-4 py-6 sm:px-6 lg:px-8"><BrandingEditor kind="avatar" /></main></AdminProtected>
}
