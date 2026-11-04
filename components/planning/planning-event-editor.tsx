"use client"

import Image from "next/image"
import { useId, useRef } from "react"
import { ImagePlus, Trash2, Scan, Maximize, UserRound, UsersRound, ChevronDown, Radio, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { channelLabel, type PlanningEvent } from "@/lib/planning/model"
import { IconChoices } from "@/components/studio/icon-choices"

const controlClass = "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground"

export function PlanningEventEditor({ event, number, dayName, creator, busy, canRemove, open, onToggle, onChange, onRemove, onImage }: {
  event: PlanningEvent; number: number; dayName: string; creator: string; busy: boolean; canRemove: boolean
  onChange: (next: Partial<PlanningEvent>) => void; onRemove: () => void; onImage: (file: File) => void
  open: boolean; onToggle: () => void
}) {
  const contentId = useId()
  const imageInput = useRef<HTMLInputElement>(null)
  const host = channelLabel(event.onOtherChannel ? event.channel : creator) || (event.onOtherChannel ? "Chaîne à préciser" : "Ma chaîne")
  const invalidTime = event.time === event.endTime
  return <fieldset className={`min-w-0 overflow-hidden rounded-2xl border bg-background/70 ${open ? "border-primary/30" : "border-border/60"}`}>
    <legend className="sr-only">Live {number} · {dayName}</legend>
    <div className="flex items-center gap-1 pr-2">
      <button type="button" aria-expanded={open} aria-controls={contentId} onClick={onToggle} className="flex min-w-0 flex-1 items-center gap-2.5 p-3 text-left transition hover:bg-muted/30 focus-visible:outline-2 focus-visible:outline-primary">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Radio className="h-4 w-4" /></span>
        <span className="min-w-0 flex-1"><span className="block text-[10px] font-medium text-primary">Live {number} · {event.time} – {event.endTime}</span><span className="mt-0.5 block truncate text-xs font-semibold">{event.game.trim() || "Live à préciser"}</span><span className="mt-0.5 block truncate text-[10px] text-muted-foreground">{host}</span></span>
        {invalidTime && <AlertCircle aria-label="Horaire à corriger" className="h-3.5 w-3.5 shrink-0 text-destructive" />}
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {canRemove && <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" disabled={busy} aria-label={`Supprimer le live ${number} du ${dayName}`} onClick={onRemove}><Trash2 className="h-3.5 w-3.5" /></Button>}
    </div>
    {open && <div id={contentId} className="space-y-3 border-t border-border/50 p-3.5">
    <div className="grid grid-cols-2 gap-3">
      <label className="space-y-1.5 text-xs text-muted-foreground">Début<input className={controlClass} type="time" value={event.time} onChange={e => { if (e.target.value) onChange({ time: e.target.value }) }} /></label>
      <label className="space-y-1.5 text-xs text-muted-foreground">Fin<input className={controlClass} type="time" value={event.endTime} onChange={e => { if (e.target.value) onChange({ endTime: e.target.value }) }} /></label>
    </div>
    {event.time === event.endTime && <p role="alert" className="text-xs text-destructive">Choisis une fin différente du début.</p>}
    <label className="block space-y-1.5 text-xs text-muted-foreground">Titre du live<Input maxLength={70} placeholder="CS2, Just Chatting, découverte…" value={event.game} onChange={e => onChange({ game: e.target.value })} /></label>
    <div className="overflow-hidden rounded-xl border border-border/60">
      {event.image && <div className="relative h-32 bg-muted/30"><Image src={event.image} alt={`Visuel du live ${number}`} fill unoptimized className={event.imageFit === "cover" ? "object-cover" : "object-contain"} /></div>}
      <input ref={imageInput} aria-label={`Visuel du live ${number} du ${dayName}`} type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} className="sr-only" onChange={e => { const file = e.target.files?.[0]; e.target.value = ""; if (file) onImage(file) }} />
      <div className="flex items-center gap-1 bg-muted/20 p-2"><Button size="sm" variant="ghost" disabled={busy} onClick={() => imageInput.current?.click()} className="min-w-0 flex-1"><ImagePlus className="mr-1.5 h-3.5 w-3.5" />{busy ? "Import…" : event.image ? "Changer" : "Ajouter un visuel"}</Button>{event.image && <Button size="sm" variant="ghost" aria-label={`Retirer le visuel du live ${number}`} title="Retirer le visuel" disabled={busy} onClick={() => onChange({ image: "" })} className="h-8 w-8 shrink-0 p-0 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>}</div>
    </div>
    {event.image && <div className="space-y-2">
      <IconChoices label="Cadrage du visuel" value={event.imageFit} columns={2} disabled={busy} onChange={imageFit => onChange({ imageFit })} options={[
        { value: "cover", label: "Remplir la carte", icon: Maximize },
        { value: "contain", label: "Image entière", icon: Scan },
      ]} />
    </div>}
    <IconChoices label="Diffusion" value={event.onOtherChannel ? "other" : "mine"} columns={2} onChange={value => onChange({ onOtherChannel: value === "other" })} options={[
      { value: "mine", label: "Sur ma chaîne", icon: UserRound },
      { value: "other", label: "Sur une autre chaîne", icon: UsersRound },
    ]} />
    {event.onOtherChannel ? <label className="block space-y-1.5 text-xs text-muted-foreground">Chaîne<Input maxLength={60} placeholder="@pseudo ou twitch.tv/pseudo" value={event.channel} onChange={e => onChange({ channel: e.target.value })} /></label> : <p className="truncate text-xs text-muted-foreground">{creator.trim() || "Renseigne ta chaîne dans « La semaine »."}</p>}
    <label className="block space-y-1.5 text-xs text-muted-foreground">Précision<Input maxLength={90} placeholder="Avec les viewers, suite de l’aventure…" value={event.note} onChange={e => onChange({ note: e.target.value })} /></label>
    </div>}
  </fieldset>
}
