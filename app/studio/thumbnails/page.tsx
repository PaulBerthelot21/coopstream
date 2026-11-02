import type { Metadata } from "next"
import { AdminProtected } from "@/components/auth/admin-protected"
import { ThumbnailEditor } from "@/components/thumbnails/thumbnail-editor"

export const metadata: Metadata = { title: "Miniatures · Studio" }

export default function StudioThumbnailsPage() {
  return <AdminProtected><main className="mx-auto w-full max-w-[1680px] px-4 py-4 sm:px-6 lg:px-8 lg:py-6"><ThumbnailEditor /></main></AdminProtected>
}
