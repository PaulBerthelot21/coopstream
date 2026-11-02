import { ImageIcon, CalendarDays } from "lucide-react"
import { WorkspaceHub } from "@/components/workspace-hub"

export default function StudioPage() {
  return <WorkspaceHub eyebrow="Espace Studio" title="Ton contenu, ta signature." description="Un espace pour créer les visuels de tes réseaux. Pars d’un modèle, personnalise et exporte." tools={[
    { title: "Miniatures YouTube", description: "Des compositions prêtes à personnaliser : ton fond, ton visage, ton titre. Export PNG 1280 × 720.", href: "/studio/thumbnails", icon: ImageIcon },
    { title: "Plannings de stream", description: "Compose ta semaine du lundi au dimanche, choisis un modèle et exporte ton programme en PNG ou JPG.", href: "/studio/planning", icon: CalendarDays },
  ]} />
}
