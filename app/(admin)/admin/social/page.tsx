import { AdminProtected } from "@/components/auth/admin-protected"
import { SocialLinksAdminPanel } from "@/components/admin/social-links-admin-panel"

export default function AdminSocialPage() {
  return (
    <AdminProtected>
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-8">
        <section className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Infos à l’écran</h1>
          <p className="text-sm text-muted-foreground">
            Tes comptes YouTube, TikTok et Instagram affichés sur l’intro rebrand.
          </p>
        </section>
        <SocialLinksAdminPanel />
      </main>
    </AdminProtected>
  )
}
