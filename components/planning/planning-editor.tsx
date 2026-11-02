"use client"

import * as React from "react"
import { CalendarDays, ChevronLeft, ChevronRight, Download, ChevronDown, RotateCcw, Radio, Moon, Clock3 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuthSession } from "@/lib/useAuthSession"
import { usePrimaryColor } from "@/components/primary-color-provider"
import { composePlanning, exportPlanning } from "@/lib/planning/compose"
import { DAY_NAMES, PLANNING_FORMATS, PLANNING_TEMPLATES, PlanningSchema, defaultPlanning, emptyDays, isCalendarDate, mondayOf, shiftDate, weekLabel, type PlanningDay, type PlanningState } from "@/lib/planning/model"

const STORAGE_KEY = "coopstream-planning-editor-v1"
const statusLabels = { live: "Live", off: "Repos", tba: "À annoncer" }
const controlClass = "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-primary"

export function PlanningEditor() {
  const { primaryColor } = usePrimaryColor()
  const session = useAuthSession() as { user?: { name?: string } } | null
  const creatorEdited = React.useRef(false)
  const [state, setState] = React.useState<PlanningState>(defaultPlanning)
  const [ready, setReady] = React.useState(false)
  const [saveStatus, setSaveStatus] = React.useState("Chargement…")
  const [selectedDay, setSelectedDay] = React.useState(0)
  const [exporting, setExporting] = React.useState(false)
  const [resetOpen, setResetOpen] = React.useState(false)
  const [previewError, setPreviewError] = React.useState("")
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = PlanningSchema.safeParse(JSON.parse(raw))
        if (parsed.success) setState(parsed.data)
        else toast.info("Le brouillon n’a pas pu être restauré. Une nouvelle semaine est prête.")
      } else if (localStorage.getItem("coopstream-overlay-preset") === "lecalme-rebrand") {
        setState(previous => ({ ...previous, template: "rebrand" }))
      }
    } catch { /* Keep the editor usable when storage is unavailable. */ }
    setReady(true)
  }, [])

  React.useEffect(() => {
    if (!ready || creatorEdited.current) return
    let candidate = session?.user?.name?.trim() || ""
    if (!/^[a-z0-9_]+$/i.test(candidate)) {
      try { candidate = localStorage.getItem("coopstream-twitch-channel") || "" } catch { candidate = "" }
    }
    const login = candidate.replace(/^@/, "").replace(/^https?:\/\/(www\.)?twitch\.tv\//i, "").split("/")[0].toLowerCase()
    if (!/^[a-z0-9_]+$/.test(login)) return
    setState(previous => previous.creator.trim() ? previous : { ...previous, creator: `twitch.tv/${login}` })
  }, [ready, session?.user?.name])

  React.useEffect(() => {
    if (!ready) return
    setSaveStatus("Enregistrement…")
    const timer = window.setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); setSaveStatus("Brouillon enregistré sur cet appareil") }
      catch { setSaveStatus("Sauvegarde indisponible · pense à exporter") }
    }, 350)
    return () => window.clearTimeout(timer)
  }, [state, ready])

  React.useEffect(() => {
    let active = true
    const buffer = document.createElement("canvas")
    void composePlanning(buffer, state, primaryColor).then(() => {
      if (!active || !canvasRef.current) return
      const canvas = canvasRef.current
      canvas.width = buffer.width
      canvas.height = buffer.height
      canvas.getContext("2d")?.drawImage(buffer, 0, 0)
      setPreviewError("")
    }).catch(() => { if (active) setPreviewError("Aperçu indisponible. Réessaie ou choisis un autre modèle.") })
    return () => { active = false }
  }, [state, primaryColor])

  function patch(next: Partial<PlanningState>) { setState(previous => ({ ...previous, ...next })) }
  function updateDay(index: number, next: Partial<PlanningDay>) {
    setState(previous => ({ ...previous, days: previous.days.map((day, i) => i === index ? { ...day, ...next } : day) }))
  }
  async function download(format: "png" | "jpeg") {
    setExporting(true)
    try { await exportPlanning(state, primaryColor, format); toast.success(`Planning exporté en ${format === "jpeg" ? "JPG" : "PNG"}`) }
    catch { toast.error("L’export a échoué. Vérifie l’aperçu et réessaie.") }
    finally { setExporting(false) }
  }
  const dimensions = PLANNING_FORMATS[state.format]
  const liveDays = state.days.filter(day => day.status === "live").length

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[.2em] text-primary">Studio · Planning</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Ta semaine en live.</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sept jours, tes rendez-vous, un visuel prêt à partager.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setResetOpen(true)} disabled={!ready}><RotateCcw className="h-4 w-4" />Vider la semaine</Button>
          <Button variant="outline" disabled={exporting || !ready} onClick={() => void download("jpeg")}><Download className="h-4 w-4" />Exporter JPG</Button>
          <Button disabled={exporting || !ready} onClick={() => void download("png")}><Download className="h-4 w-4" />{exporting ? "Export en cours…" : "Exporter PNG"}</Button>
        </div>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <div className="min-w-0 space-y-5">
          <section aria-label="Réglages du planning" className="space-y-4 rounded-2xl border border-border/70 bg-card/50 p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold"><CalendarDays className="h-4 w-4 text-primary" />La semaine</h2>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!state.showDates} onChange={event => patch({ showDates: !event.target.checked })} className="accent-primary" />Sans dates précises</label>
            {state.showDates ? <div className="flex items-center gap-2">
              <Button size="icon" variant="outline" aria-label="Semaine précédente" onClick={() => patch({ weekStart: shiftDate(state.weekStart, -7) })}><ChevronLeft /></Button>
              <label className="min-w-0 flex-1 text-xs text-muted-foreground">Semaine du lundi<input aria-label="Semaine du lundi" type="date" className={`${controlClass} mt-1`} value={state.weekStart} onChange={event => { if (isCalendarDate(event.target.value)) patch({ weekStart: mondayOf(event.target.value) }) }} /></label>
              <Button size="icon" variant="outline" aria-label="Semaine suivante" onClick={() => patch({ weekStart: shiftDate(state.weekStart, 7) })}><ChevronRight /></Button>
            </div> : <div className="rounded-lg bg-muted/40 px-3 py-3 text-xs text-muted-foreground">Une semaine type, du lundi au dimanche, à réutiliser.</div>}
            <p className="text-xs text-muted-foreground">{state.showDates ? weekLabel(state.weekStart) : "Chaque semaine"} · horaires de Paris</p>
            <label className="block space-y-1.5 text-xs text-muted-foreground">Titre<Input maxLength={45} value={state.title} onChange={event => patch({ title: event.target.value })} placeholder="LE PLANNING" /></label>
            <label className="block space-y-1.5 text-xs text-muted-foreground">Chaîne ou signature<Input maxLength={60} value={state.creator} onChange={event => { creatorEdited.current = true; patch({ creator: event.target.value }) }} placeholder="twitch.tv/toncompte" /></label>
            <label className="block space-y-1.5 text-xs text-muted-foreground">Petit message<Input maxLength={100} value={state.subtitle} onChange={event => patch({ subtitle: event.target.value })} placeholder="On se retrouve en live." /></label>
          </section>

          <section aria-label="Programme du lundi au dimanche" className="overflow-hidden rounded-2xl border border-border/70 bg-card/50">
            <div className="flex items-center justify-between border-b border-border/60 p-5"><h2 className="text-sm font-semibold">Les rendez-vous</h2><span className="text-xs text-muted-foreground">{liveDays} jour{liveDays > 1 ? "s" : ""} de live</span></div>
            {state.days.map((day, index) => {
              const active = selectedDay === index
              const Icon = day.status === "live" ? Radio : day.status === "off" ? Moon : Clock3
              return <div key={DAY_NAMES[index]} className="border-b border-border/50 last:border-b-0">
                <button type="button" aria-expanded={active} aria-controls={`planning-day-${index}`} onClick={() => setSelectedDay(active ? -1 : index)} className={`flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-muted/40 ${active ? "bg-primary/5" : ""}`}>
                  <Icon className={`h-4 w-4 shrink-0 ${day.status === "live" ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="flex-1 text-sm font-medium">{DAY_NAMES[index]}</span>
                  <span className="max-w-[150px] truncate text-xs text-muted-foreground">{day.status === "live" ? `${day.time} · ${day.game || "Live à préciser"}` : statusLabels[day.status]}</span>
                  <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition ${active ? "rotate-180" : ""}`} />
                </button>
                {active && <div id={`planning-day-${index}`} className="space-y-3 px-5 pb-5">
                  <label className="block space-y-1.5 text-xs text-muted-foreground">Statut du {DAY_NAMES[index].toLowerCase()}<select aria-label={`Statut du ${DAY_NAMES[index].toLowerCase()}`} className={controlClass} value={day.status} onChange={event => updateDay(index, { status: event.target.value as PlanningDay["status"] })}><option value="live">Live</option><option value="off">Repos</option><option value="tba">À annoncer</option></select></label>
                  {day.status === "live" && <>
                    <label className="block space-y-1.5 text-xs text-muted-foreground">Horaire du {DAY_NAMES[index].toLowerCase()}<input className={controlClass} type="time" value={day.time} onChange={event => { if (event.target.value) updateDay(index, { time: event.target.value }) }} /></label>
                    <label className="block space-y-1.5 text-xs text-muted-foreground">Jeu ou activité du {DAY_NAMES[index].toLowerCase()}<Input maxLength={70} placeholder="CS2, Just Chatting, découverte…" value={day.game} onChange={event => updateDay(index, { game: event.target.value })} /></label>
                    <label className="block space-y-1.5 text-xs text-muted-foreground">Diffusion du {DAY_NAMES[index].toLowerCase()}<select aria-label={`Diffusion du ${DAY_NAMES[index].toLowerCase()}`} className={controlClass} value={day.onOtherChannel ? "other" : "mine"} onChange={event => updateDay(index, { onOtherChannel: event.target.value === "other" })}><option value="mine">Sur ma chaîne</option><option value="other">Sur une autre chaîne</option></select></label>
                    {day.onOtherChannel ? <label className="block space-y-1.5 text-xs text-muted-foreground">Chaîne du {DAY_NAMES[index].toLowerCase()}<Input maxLength={60} placeholder="@pseudo ou twitch.tv/pseudo" value={day.channel} onChange={event => updateDay(index, { channel: event.target.value })} /></label> : <p className="text-xs text-muted-foreground">{state.creator.trim() || "Renseigne ta chaîne en haut du planning."}</p>}
                    <label className="block space-y-1.5 text-xs text-muted-foreground">Précision du {DAY_NAMES[index].toLowerCase()}<Input maxLength={90} placeholder="Avec les viewers, suite de l’aventure…" value={day.note} onChange={event => updateDay(index, { note: event.target.value })} /></label>
                  </>}
                  {day.status === "off" && <p className="text-xs text-muted-foreground">Une journée sans live, affichée comme repos.</p>}
                </div>}
              </div>
            })}
          </section>
        </div>

        <section className="min-w-0 space-y-4 xl:sticky xl:top-[72px]">
          <div className="grid gap-2 sm:grid-cols-3" aria-label="Modèles de planning">
            {PLANNING_TEMPLATES.map(template => <button type="button" key={template.id} aria-pressed={state.template === template.id} onClick={() => patch({ template: template.id })} className={`rounded-xl border p-4 text-left transition ${state.template === template.id ? "border-primary bg-primary/5" : "border-border/70 bg-card/50 hover:border-primary/40"}`}><p className="text-sm font-semibold">{template.label}</p><p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{template.description}</p></button>)}
          </div>
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/50">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
              <h2 className="text-sm font-medium">Aperçu du planning</h2>
              <select aria-label="Disposition du planning" className={`${controlClass} w-auto max-w-full`} value={state.layout} onChange={event => patch({ layout: event.target.value as PlanningState["layout"] })}><option value="poster">Affiche · titre sur le côté</option><option value="vertical">Liste verticale · titre en haut</option><option value="columns">Colonnes · une carte par jour</option></select>
              <select aria-label="Format du planning" className={`${controlClass} w-auto max-w-full`} value={state.format} onChange={event => patch({ format: event.target.value as PlanningState["format"] })}>{Object.entries(PLANNING_FORMATS).map(([id, format]) => <option key={id} value={id}>{format.label}</option>)}</select>
            </div>
            <div className="flex min-h-[300px] items-center justify-center bg-muted/20 p-4 sm:p-6">
              <canvas ref={canvasRef} width={dimensions.width} height={dimensions.height} role="img" aria-label="Aperçu du planning de la semaine" className={`h-auto w-full rounded-lg shadow-lg ${state.format === "story" ? "max-w-[360px]" : state.format === "portrait" ? "max-w-[460px]" : ""}`} />
            </div>
            {previewError && <p role="alert" className="px-4 pb-4 text-sm text-destructive">{previewError}</p>}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 px-4 py-3 text-[11px] text-muted-foreground"><span>{dimensions.width} × {dimensions.height} px · PNG / JPG</span><span role="status">{saveStatus}</span></div>
          </div>
          <div className="flex flex-wrap gap-5 rounded-xl border border-border/60 px-4 py-3 text-xs text-muted-foreground">
            <label className="flex items-center gap-2"><input type="checkbox" checked={state.hideOff} onChange={event => patch({ hideOff: event.target.checked })} className="accent-primary" />Masquer les jours de repos</label>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">Ton brouillon reste sur ce navigateur. Changer de semaine conserve tes rendez-vous pour préparer la suivante. Ce planning est un visuel à partager ; il ne modifie pas ton planning Twitch.</p>
        </section>
      </div>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}><DialogContent><DialogHeader><DialogTitle>Vider les rendez-vous ?</DialogTitle><DialogDescription>Les sept jours repasseront à « À annoncer ». Le modèle, les dates et ta signature seront conservés.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setResetOpen(false)}>Garder ma semaine</Button><Button onClick={() => { patch({ days: emptyDays() }); setResetOpen(false) }}>Vider la semaine</Button></DialogFooter></DialogContent></Dialog>
    </div>
  )
}
