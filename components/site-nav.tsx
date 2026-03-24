"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  MonitorPlay,
  Settings2,
  Menu,
  X,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useAuthSession } from "@/lib/useAuthSession"
import { signInWithTwitch } from "@/lib/auth.client"
import { authClient } from "@/lib/auth.client"

function TwitchLogo({ className }: { className?: string }) {
  // SVG simple (bulles + queue) pour rester autonome (pas de fichier public dédié).
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M4 3h16v10.2c0 .4-.2.8-.5 1.1l-3.2 3.2c-.3.3-.7.5-1.1.5H10.5c-.4 0-.8-.2-1.1-.5l-.9-.9H6.5c-.9 0-1.5-.6-1.5-1.5V3zm4.5 3.5v7h2v-7h-2zm6 0v7h2v-7h-2z" />
      <path d="M10.5 16.5l-2-2V6.5h2v10zm5 0l-2-2V6.5h2v10z" opacity="0.18" />
    </svg>
  )
}

const links = [
  { href: "/admin", label: "Admin" },
  { href: "/overlay", label: "Overlay" },
  { href: "/skins", label: "Skins" },
] as const

const OVERLAY_ONLY_PATHS = [
  "/overlay-defi-carrousel",
  "/overlay-chat",
  "/overlay-camera",
  "/overlay-follower-goal",
  "/overlay-intro",
  "/overlay-last-follower",
  "/overlay-new-follower",
  "/overlay-wheel-texte",
]

const TWITCH_CHANNEL_STORAGE = "coopstream-twitch-channel"

export function SiteNav() {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)
  const session = useAuthSession()
  const isAuthed = Boolean((session as any)?.user)
  const user = (session as any)?.user as
    | { name?: string; email?: string; image?: string }
    | undefined
  const displayName = user?.name ?? user?.email ?? "Twitch"
  const avatarUrl = user?.image ?? null

  function normalizeChannel(input: string) {
    let ch = input.trim()
    ch = ch.replace(/^@/, "")
    ch = ch.replace(/^https?:\/\/(www\.)?twitch\.tv\//i, "")
    ch = ch.split("/")[0] ?? ""
    return ch.toLowerCase()
  }

  // Pré-remplit automatiquement le canal Twitch utilisé par les overlays.
  // Si l'utilisateur a déjà une valeur en localStorage, on ne l'écrase pas.
  React.useEffect(() => {
    if (!isAuthed) return

    try {
      const existing = window.localStorage.getItem(
        TWITCH_CHANNEL_STORAGE,
      )
      if (existing && existing.trim()) return

      const candidate = (user?.name ?? user?.email ?? "").toString()
      if (!candidate.trim()) return

      const normalized = normalizeChannel(candidate)
      if (!normalized) return

      window.localStorage.setItem(TWITCH_CHANNEL_STORAGE, normalized)
    } catch {
      // ignore
    }
  }, [isAuthed, user?.name, user?.email])

  if (OVERLAY_ONLY_PATHS.some((p) => pathname.startsWith(p))) return null

  const getIconFor = (href: string) => {
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
          <Link href="/" className="flex items-center gap-2 rounded-full bg-primary/5 px-3 py-1 ring-1 ring-primary/25">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_14px_rgba(79,70,229,0.9)]">
              <LayoutDashboard className="h-3 w-3" />
            </span>
            <span className="hidden text-xs font-semibold uppercase tracking-[0.2em] text-primary sm:inline">
              CoopStream
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-3 md:flex">
            <nav className="flex gap-1 pr-1">
              {links
                .filter((l) => (l.href === "/admin" ? isAuthed : true))
                .map((link) => {
                  const active = pathname.startsWith(link.href)
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
            {isAuthed ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Ouvrir le menu utilisateur"
                    className="border-border/60"
                  >
                    <Avatar className="h-7 w-7">
                      {avatarUrl ? (
                        <AvatarImage
                          src={avatarUrl}
                          alt={displayName}
                          referrerPolicy="no-referrer"
                        />
                      ) : null}
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {displayName?.[0]?.toUpperCase?.() ?? "T"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuLabel>Compte</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Mon profil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">Paramètres</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault()
                      void authClient.signOut()
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="outline"
                size="icon"
                aria-label="Connect with Twitch"
                onClick={() => void signInWithTwitch()}
                className="border-border/60"
              >
                <TwitchLogo className="h-4 w-4 text-[#9146FF]" />
              </Button>
            )}
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
            {links
              .filter((l) => (l.href === "/admin" ? isAuthed : true))
              .map((link) => {
                const active = pathname.startsWith(link.href)
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

