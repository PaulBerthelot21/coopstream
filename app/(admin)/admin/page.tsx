import { Target, Sparkles, Zap, Share2, ListChecks, MonitorPlay } from "lucide-react"
import { WorkspaceHub } from "@/components/workspace-hub"

export default function LivePage() {
  return <WorkspaceHub eyebrow="Espace Live" title="Aux commandes du live." description="Prépare tes objectifs, anime tes défis et garde les commandes à portée de main. Tout ce qui vit à l’écran se pilote ici." tools={[
    { title: "Objectifs", description: "Fixe le prochain palier de followers et personnalise son affichage.", href: "/admin/follower-goal", icon: Target },
    { title: "Roue des défis", description: "Prépare les défis du tirage et anime les moments forts du stream.", href: "/admin/wheel", icon: Sparkles },
    { title: "Défis & progression", description: "Crée tes défis et fais avancer les compteurs en direct.", href: "/admin/challenges", icon: ListChecks },
    { title: "Commandes Streamdeck", description: "Retrouve les boutons rapides pour mettre à jour tes défis.", href: "/admin/streamdeck", icon: Zap },
    { title: "Infos à l’écran", description: "Renseigne tes comptes YouTube, TikTok et Instagram pour l’intro.", href: "/admin/social", icon: Share2 },
    { title: "Prêt pour OBS", description: "Retrouve les aperçus de tes overlays et les liens de tes sources OBS.", href: "/overlay", icon: MonitorPlay },
  ]} />
}
