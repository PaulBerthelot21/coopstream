import type { Metadata } from "next"

import { AdminProtected } from "@/components/auth/admin-protected"
import { ThumbnailEditor } from "@/components/thumbnails/thumbnail-editor"

export const metadata: Metadata = {
  title: "Éditeur de miniatures",
}

export default function AdminThumbnailsPage() {
  return (
    <AdminProtected>
      <main className="mx-auto flex min-h-[calc(100vh-0px)] w-full max-w-[1680px] flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <ThumbnailEditor />
      </main>
    </AdminProtected>
  )
}
