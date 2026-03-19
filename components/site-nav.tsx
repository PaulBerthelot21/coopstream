"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

const links = [
  { href: "/", label: "Accueil" },
  { href: "/admin", label: "Admin" },
  { href: "/overlay", label: "Overlay" },
]

export function SiteNav() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-12 w-full max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold tracking-tight text-muted-foreground">
            CoopStream
          </span>
        </div>
        <div className="flex items-center gap-2">
          <nav className="flex gap-2">
            {links.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href)
              return (
                <Button
                  key={link.href}
                  asChild
                  variant={active ? "secondary" : "outline"}
                  size="sm"
                >
                  <Link href={link.href}>{link.label}</Link>
                </Button>
              )
            })}
          </nav>
          <div className="flex gap-1 rounded-full bg-background/80 p-0.5 ring-1 ring-border/60">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={
                "rounded-full px-2 py-0.5 text-[11px] transition " +
                (theme === "light"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              Clair
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={
                "rounded-full px-2 py-0.5 text-[11px] transition " +
                (theme === "dark"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              Sombre
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

