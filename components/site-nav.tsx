"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  LayoutDashboard,
  MonitorPlay,
  Settings2,
  Menu,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"

const links = [
  { href: "/", label: "Accueil" },
  { href: "/admin", label: "Admin" },
  { href: "/overlay", label: "Overlay" },
  { href: "/skins", label: "Skins" },
  { href: "/settings", label: "Paramètres" },
] as const

const OVERLAY_ONLY_PATHS = [
  "/overlay-defi-carrousel",
  "/overlay-chat",
  "/overlay-cs2",
]

export function SiteNav() {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)

  if (OVERLAY_ONLY_PATHS.some((p) => pathname.startsWith(p))) return null

  const getIconFor = (href: string) => {
    if (href === "/") return Home
    if (href === "/admin") return LayoutDashboard
    if (href === "/overlay") return MonitorPlay
    if (href === "/recap") return LayoutDashboard
    if (href === "/skins") return MonitorPlay
    return Settings2
  }

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl" suppressHydrationWarning>
      <div className="mx-auto flex h-12 w-full max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-full bg-primary/5 px-3 py-1 ring-1 ring-primary/25">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_14px_rgba(79,70,229,0.9)]">
              <LayoutDashboard className="h-3 w-3" />
            </span>
            <span className="hidden text-xs font-semibold uppercase tracking-[0.2em] text-primary sm:inline">
              CoopStream
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-3 md:flex">
            <nav className="flex gap-1 pr-1">
              {links.map((link) => {
                const active =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href)
                const Icon = getIconFor(link.href)
                return (
                  <Button
                    key={link.href}
                    asChild
                    variant={active ? "secondary" : "outline"}
                    size="sm"
                    className="gap-1.5"
                  >
                    <Link href={link.href}>
                      <Icon className="h-3.5 w-3.5" />
                      <span>{link.label}</span>
                    </Link>
                  </Button>
                )
              })}
            </nav>
          </div>
          <div className="flex gap-1 rounded-full bg-background/80 p-0.5 ring-1 ring-border/60">
            {/* Le sélecteur clair/sombre est dans la page Paramètres. */}
          </div>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/60 bg-background text-muted-foreground hover:text-foreground md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Ouvrir la navigation"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-border/60 bg-background/95 backdrop-blur-xl md:hidden">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-4 py-3">
            {links.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href)
              const Icon = getIconFor(link.href)
              return (
                <Button
                  key={link.href}
                  asChild
                  variant={active ? "secondary" : "outline"}
                  size="sm"
                  className="justify-start gap-1.5"
                  onClick={() => setOpen(false)}
                >
                  <Link href={link.href}>
                    <Icon className="h-3.5 w-3.5" />
                    <span>{link.label}</span>
                  </Link>
                </Button>
              )
            })}
          </div>
        </div>
      )}
    </header>
  )
}

