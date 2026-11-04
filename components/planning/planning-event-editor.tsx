"use client"

import Image from "next/image"
import { ImagePlus, Trash2, Scan, Maximize, UserRound, UsersRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { PlanningEvent } from "@/lib/planning/model"
import { IconChoices } from "@/components/studio/icon-choices"

const controlClass = "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground"

export function PlanningEventEditor({ event, number, dayName, creator, busy, canRemove, onChange, onRemove, onImage }: {
  event: PlanningEvent; number: number; dayName: string; creator: string; busy: boolean; canRemove: boolean
  onChange: (next: Partial<PlanningEvent>) => void; onRemove: () => void; onImage: (file: File) => void
}) {
  return <fieldset className="min-w-0 space-y-3 rounded-2xl border border-border/70 bg-background/70 p-3.5">
    <legend className="px-1.5 text-xs font-semibold">Live {number} · {dayName}</legend>
    <div className="flex items-center justify-between gap-2">
      <span className="text-[11px] font-medium text-primary">{event.time} — {event.endTime}</span>
      {canRemove && <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" disabled={busy} aria-label={`Supprimer le live ${number} du ${dayName}`} onClick={onRemove}><Trash2 className="h-3.5 w-3.5" /></Button>}
    </div>
    <div className="grid grid-cols-2 gap-3">
      <label className="space-y-1.5 text-xs text-muted-foreground">Début<input className={controlClass} type="time" value={event.time} onChange={e => { if (e.target.value) onChange({ time: e.target.value }) }} /></label>
      <label className="space-y-1.5 text-xs text-muted-foreground">Fin<input className={controlClass} type="time" value={event.endTime} onChange={e => { if (e.target.value) onChange({ endTime: e.target.value }) }} /></label>
    </div>
    {event.time === event.endTime && <p role="alert" className="text-xs text-destructive">Choisis une fin différente du début.</p>}
    <label className="block space-y-1.5 text-xs text-muted-foreground">Titre du live<Input maxLength={70} placeholder="CS2, Just Chatting, découverte…" value={event.game} onChange={e => onChange({ game: e.target.value })} /></label>
    <div className="overflow-hidden rounded-xl border border-border/60">
      {event.image && <div className="relative h-32 bg-muted/30"><Image src={event.image} alt={`Visuel du live ${number}`} fill unoptimized className={event.imageFit === "cover" ? "object-cover" : "object-contain"} /></div>}
      <label className="flex cursor-pointer items-center gap-2 bg-muted/20 p-3 text-xs font-medium hover:bg-muted/40">
        <ImagePlus className="h-4 w-4 text-primary" />{busy ? "Import en cours…" : event.image ? "Changer le visuel" : "Ajouter un visuel"}
        <input aria-label={`Visuel du live ${number} du ${dayName}`} type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} className="sr-only" onChange={e => { const file = e.target.files?.[0]; e.target.value = ""; if (file) onImage(file) }} />
      </label>
    </div>
    {event.image && <div className="space-y-2">
      <IconChoices label="Cadrage du visuel" value={event.imageFit} columns={2} disabled={busy} onChange={imageFit => onChange({ imageFit })} options={[
        { value: "cover", label: "Remplir la carte", icon: Maximize },
        { value: "contain", label: "Image entière", icon: Scan },
      ]} />
      <Button size="sm" variant="ghost" disabled={busy} onClick={() => onChange({ image: "" })}>Retirer</Button>
    </div>}
    <IconChoices label="Diffusion" value={event.onOtherChannel ? "other" : "mine"} columns={2} onChange={value => onChange({ onOtherChannel: value === "other" })} options={[
      { value: "mine", label: "Sur ma chaîne", icon: UserRound },
      { value: "other", label: "Sur une autre chaîne", icon: UsersRound },
    ]} />
    {event.onOtherChannel ? <label className="block space-y-1.5 text-xs text-muted-foreground">Chaîne<Input maxLength={60} placeholder="@pseudo ou twitch.tv/pseudo" value={event.channel} onChange={e => onChange({ channel: e.target.value })} /></label> : <p className="truncate text-xs text-muted-foreground">{creator.trim() || "Renseigne ta chaîne dans « La semaine »."}</p>}
    <label className="block space-y-1.5 text-xs text-muted-foreground">Précision<Input maxLength={90} placeholder="Avec les viewers, suite de l’aventure…" value={event.note} onChange={e => onChange({ note: e.target.value })} /></label>
  </fieldset>
}
