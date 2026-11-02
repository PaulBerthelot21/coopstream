export const workspaces = [
  { href: "/admin", label: "Live", links: [
    { href: "/admin", label: "Vue d’ensemble" },
    { href: "/admin/follower-goal", label: "Objectifs" },
    { href: "/admin/wheel", label: "Roue" },
    { href: "/admin/challenges", label: "Défis" },
    { href: "/admin/streamdeck", label: "Streamdeck" },
    { href: "/admin/social", label: "Infos à l’écran" },
  ] },
  { href: "/studio", label: "Studio", links: [
    { href: "/studio", label: "Vue d’ensemble" },
    { href: "/studio/thumbnails", label: "Miniatures YouTube" },
    { href: "/studio/planning", label: "Planning" },
  ] },
  { href: "/overlay", label: "Overlays", links: [
    { href: "/overlay", label: "Bibliothèque OBS" },
    { href: "/overlay-test", label: "Tester les alertes" },
    { href: "/stinger", label: "Transitions" },
  ] },
] as const

export function workspaceForPath(path: string) {
  if (path === "/admin/thumbnails") return workspaces[1]
  return workspaces.find(space => space.links.some(link => path === link.href || path.startsWith(`${link.href}/`)))
}
