import { Radio, Palette, MonitorPlay } from "lucide-react"
import { WorkspaceHub } from "@/components/workspace-hub"

export default function HomePage() {
  return <WorkspaceHub eyebrow="CoopStream" title="Du live à la publication." description="Un seul endroit pour piloter ton stream, créer tes visuels et préparer tes scènes OBS. Choisis ton espace." tools={[
    { title: "Live", description: "Objectifs, roue, défis et commandes rapides : le poste de contrôle de ton stream.", href: "/admin", icon: Radio },
    { title: "Studio", description: "Miniatures et plannings : les outils pour donner une signature à tes contenus.", href: "/studio", icon: Palette },
    { title: "Overlays", description: "Explore les habillages, teste les alertes et récupère tes liens OBS.", href: "/overlay", icon: MonitorPlay },
  ]} />
}
