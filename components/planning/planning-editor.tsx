"use client"

import * as React from "react"
import { StudioHeader, StudioModeSwitch, type StudioMode } from "@/components/studio/editor-chrome"
import { CalendarDays, ChevronLeft, ChevronRight, Download, RotateCcw, Radio, Moon, Clock3, Plus, Palette, Eye, MousePointer2, RectangleHorizontal, RectangleVertical, Smartphone, Sun, Gem, ListChecks, Images, EyeOff, PanelLeft, Rows3, Columns3 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuthSession } from "@/lib/useAuthSession"
import { usePrimaryColor } from "@/components/primary-color-provider"
import { IconChoices } from "@/components/studio/icon-choices"
import { composePlanning, exportPlanning } from "@/lib/planning/compose"
import { PlanningEventEditor } from "./planning-event-editor"
import { importPlanningImage } from "@/lib/planning/images"
import { DAY_NAMES, PLANNING_FORMATS, PLANNING_TEMPLATES, PlanningSchema, defaultPlanning, emptyDays, newPlanningEvent, isCalendarDate, mondayOf, shiftDate, weekLabel, type PlanningDay, type PlanningEvent, type PlanningState } from "@/lib/planning/model"

import { readPlanningDraft, savePlanningDraft } from "@/lib/planning/draft"
const statusLabels = { live: "Live", off: "Repos", tba: "À annoncer" }
const controlClass = "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-primary"

export function PlanningEditor() {
  const { primaryColor } = usePrimaryColor()
  const session = useAuthSession() as { user?: { name?: string } } | null
  const creatorEdited = React.useRef(false)
  const [state, setState] = React.useState<PlanningState>(defaultPlanning)
  const [ready, setReady] = React.useState(false)
  const [saveStatus, setSaveStatus] = React.useState("Chargement…")
  const [selectedDay, setSelectedDay] = React.useState(-1)
  const [mode, setMode] = React.useState<StudioMode>("edit")
  const [panel, setPanel] = React.useState<"programme" | "design">("programme")
  const [exporting, setExporting] = React.useState(false)
  const [exportFormat, setExportFormat] = React.useState<"png" | "jpeg">("png")
  const [expandedEvents, setExpandedEvents] = React.useState<Record<number, string>>({})
  const [resetOpen, setResetOpen] = React.useState(false)
  const [previewError, setPreviewError] = React.useState("")
  const [importingImage, setImportingImage] = React.useState(false)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    let active = true
    void (async () => {
      try {
        const raw = await readPlanningDraft()
        if (!active) return
        if (raw !== undefined) {
          const parsed = PlanningSchema.safeParse(raw)
          if (parsed.success) setState({ ...parsed.data, ...(parsed.data.layout === "timeline" ? { layout: "vertical" } : {}), ...(parsed.data.eventView === "timeline" || parsed.data.layout === "timeline" ? { eventView: "balanced" } : {}) })
          else toast.info("Le brouillon n’a pas pu être restauré. Une nouvelle semaine est prête.")
        } else if (localStorage.getItem("coopstream-overlay-preset") === "lecalme-rebrand") {
          setState(previous => ({ ...previous, template: "rebrand" }))
        }
      } catch { /* Keep the editor usable when storage is unavailable. */ }
      finally { if (active) setReady(true) }
    })()
    return () => { active = false }
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
    let active = true
    const timer = window.setTimeout(() => {
      void savePlanningDraft(state).then(() => { if (active) setSaveStatus("Brouillon enregistré sur cet appareil") }).catch(() => { if (active) setSaveStatus("Sauvegarde indisponible · pense à exporter") })
    }, 350)
    return () => { active = false; window.clearTimeout(timer) }
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
  function updateEvent(index: number, id: string, next: Partial<PlanningEvent>) {
    setState(previous => ({ ...previous, days: previous.days.map((day, i) => i === index ? { ...day, events: day.events.map(event => event.id === id ? { ...event, ...next } : event) } : day) }))
  }
  function addEvent(index: number) {
    const event = newPlanningEvent()
    setState(previous => ({ ...previous, days: previous.days.map((day, i) => i === index && day.events.length < 6 ? { ...day, status: "live", events: [...day.events, event] } : day) }))
    setExpandedEvents(previous => ({ ...previous, [index]: event.id }))
  }
  function removeEvent(index: number, id: string) {
    setState(previous => ({ ...previous, days: previous.days.map((day, i) => i === index && day.events.length > 1 ? { ...day, events: day.events.filter(event => event.id !== id) } : day) }))
    setExpandedEvents(previous => ({ ...previous, [index]: state.days[index].events.find(event => event.id !== id)?.id ?? "" }))
  }
  async function uploadImage(index: number, id: string, file: File) {
    setImportingImage(true)
    try {
      const image = await importPlanningImage(file)
      updateEvent(index, id, { image })
      toast.success("Affiche ajoutée au planning")
    } catch (error) { toast.error(error instanceof Error ? error.message : "L’import a échoué.") }
    finally { setImportingImage(false) }
  }
  async function download(format: "png" | "jpeg") {
    setExporting(true)
    try { await exportPlanning(state, primaryColor, format); toast.success(`Planning exporté en ${format === "jpeg" ? "JPG" : "PNG"}`) }
    catch { toast.error("L’export a échoué. Vérifie l’aperçu et réessaie.") }
    finally { setExporting(false) }
  }
  const dimensions = PLANNING_FORMATS[state.format]
  const invalidDays = state.days.map((day, i) => day.status === "live" && day.events.some(event => event.time === event.endTime) ? DAY_NAMES[i] : null).filter(Boolean)
  const liveCount = state.days.reduce((count, day) => count + (day.status === "live" ? day.events.length : 0), 0)

  const day = selectedDay >= 0 ? state.days[selectedDay] : null
  return <div className="space-y-4" data-testid="planning-editor">
    <StudioHeader title="Planning des streams" section="Planning" status={saveStatus}>
      <Button variant="outline" disabled={!ready || importingImage || mode === "preview"} onClick={() => setResetOpen(true)}><RotateCcw className="mr-2 h-4 w-4" />Vider la semaine</Button>
      <div role="group" aria-label="Format d’export" className="inline-flex rounded-lg border border-border/60 bg-card/60 p-1">{([['png', 'PNG'], ['jpeg', 'JPG']] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={exportFormat === value} disabled={exporting} onClick={() => setExportFormat(value)} className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition ${exportFormat === value ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted"}`}>{label}</button>)}</div>
      <Button disabled={exporting || importingImage || !ready || invalidDays.length > 0 || Boolean(previewError)} onClick={() => void download(exportFormat)}><Download className="mr-2 h-4 w-4" />{exporting ? "Export…" : "Exporter"}</Button>
    </StudioHeader>
    <div className="flex flex-wrap items-center justify-between gap-3"><StudioModeSwitch value={mode} onChange={setMode} /><span className="text-xs text-muted-foreground">{state.showDates ? weekLabel(state.weekStart) : "Chaque semaine"} · {liveCount} live{liveCount > 1 ? "s" : ""}</span></div>
    {invalidDays.length > 0 && <p role="alert" className="text-sm text-destructive">Corrige l’heure de fin : {invalidDays.join(", ")}.</p>}
    <div className={`grid items-start gap-3 ${mode === "edit" ? "xl:grid-cols-[220px_minmax(0,1fr)_300px]" : "mx-auto max-w-[1200px]"}`}>
      <aside className={`overflow-hidden rounded-2xl border border-border/60 bg-card/60 xl:sticky xl:top-20 ${mode === "preview" ? "hidden" : ""}`} aria-label="Navigation du planning">
        <div className="grid grid-cols-2 border-b border-border/60 p-2">{([['programme', 'Semaine', CalendarDays], ['design', 'Design', Palette]] as const).map(([id, label, Icon]) => <button key={id} type="button" aria-pressed={panel === id} onClick={() => setPanel(id)} className={`flex items-center justify-center gap-2 rounded-lg px-2 py-2 text-xs font-medium ${panel === id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}><Icon className="h-3.5 w-3.5" />{label}</button>)}</div>
        {panel === "programme" ? <div className="space-y-3 p-3">
          <button type="button" aria-pressed={selectedDay < 0} onClick={() => setSelectedDay(-1)} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left ${selectedDay < 0 ? "border-primary/50 bg-primary/10" : "border-border/50 hover:bg-muted/60"}`}><CalendarDays className="h-4 w-4 text-primary" /><span><span className="block text-xs font-medium">La semaine</span><span className="text-[10px] text-muted-foreground">Dates, titre & signature</span></span></button>
          <div aria-label="Programme du lundi au dimanche" className="space-y-1">{state.days.map((entry, index) => {
            const Icon = entry.status === "live" ? Radio : entry.status === "off" ? Moon : Clock3
            return <button key={DAY_NAMES[index]} type="button" aria-pressed={selectedDay === index} onClick={() => setSelectedDay(index)} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${selectedDay === index ? "border-primary/50 bg-primary/10" : "border-transparent hover:bg-muted/60"}`}><Icon className={`h-4 w-4 shrink-0 ${entry.status === "live" ? "text-primary" : "text-muted-foreground"}`} /><span className="min-w-0"><span className="block text-xs font-medium">{DAY_NAMES[index]}</span><span className="block truncate text-[10px] text-muted-foreground">{entry.status === "live" ? `${entry.events.length} live${entry.events.length > 1 ? "s" : ""} · ${entry.events[0].time}` : statusLabels[entry.status]}</span></span></button>
          })}</div><p className="px-1 text-[10px] leading-relaxed text-muted-foreground">Choisis un jour pour modifier ses lives dans le panneau Propriétés.</p>
        </div> : <div className="space-y-5 p-4">
          <IconChoices label="Format" value={state.format} onChange={format => patch({ format })} options={[
            { value: "landscape", label: "Paysage", detail: "16:9 · 1920 × 1080", icon: RectangleHorizontal },
            { value: "portrait", label: "Publication", detail: "4:5 · 1080 × 1350", icon: RectangleVertical },
            { value: "story", label: "Story", detail: "9:16 · 1080 × 1920", icon: Smartphone },
          ]} />
          <IconChoices label="Ambiance" value={state.template} onChange={template => patch({ template })} options={PLANNING_TEMPLATES.map(template => ({ value: template.id, label: template.label, detail: template.description, icon: template.id === "paper" ? Sun : template.id === "rebrand" ? Gem : Moon }))} />
          <IconChoices label="Présentation des lives" value={state.eventView} onChange={eventView => patch({ eventView })} options={[
            { value: "balanced", label: "Équilibré", detail: "Titre, chaîne et horaire.", icon: ListChecks },
            { value: "posters", label: "Cartes visuelles", detail: "Images, titres et horaires par jour.", icon: Images },
          ]} />
          {state.eventView !== "posters" && <IconChoices label="Disposition" value={state.layout} onChange={layout => patch({ layout })} options={[
            { value: "poster", label: "Affiche", detail: "Le titre à côté des rendez-vous.", icon: PanelLeft },
            { value: "vertical", label: "Liste", detail: "Les rendez-vous les uns sous les autres.", icon: Rows3 },
            { value: "columns", label: "Colonnes", detail: "Une colonne pour chaque jour.", icon: Columns3 },
          ]} />}
          <button type="button" role="switch" aria-checked={state.hideOff} aria-label="Masquer les jours de repos" onClick={() => patch({ hideOff: !state.hideOff })} className={`flex w-full items-center gap-2.5 rounded-xl border p-3 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${state.hideOff ? "border-primary/50 bg-primary/10" : "border-border/60 bg-background/30 hover:bg-muted/50"}`}>
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${state.hideOff ? "bg-primary/15 text-primary" : "bg-muted/60 text-muted-foreground"}`}>{state.hideOff ? <EyeOff className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</span>
            <span className="min-w-0 flex-1"><span className="block text-[11px] font-medium">Masquer les jours de repos</span><span className="mt-1 block text-[10px] text-muted-foreground">{state.hideOff ? "Les jours de repos sont masqués." : "Tous les jours restent visibles."}</span></span>
            <span aria-hidden="true" className={`flex h-4 w-7 shrink-0 items-center rounded-full p-0.5 transition ${state.hideOff ? "bg-primary" : "bg-muted-foreground/30"}`}><span className={`h-3 w-3 rounded-full bg-white shadow transition-transform ${state.hideOff ? "translate-x-3" : ""}`} /></span>
          </button>
        </div>}
      </aside>
      <section className="min-w-0 overflow-hidden rounded-2xl border border-border/60 bg-card/40">
        <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3"><h2 className="inline-flex items-center gap-2 text-xs text-muted-foreground">{mode === "preview" ? <Eye className="h-3.5 w-3.5 text-primary" /> : <MousePointer2 className="h-3.5 w-3.5 text-primary" />}{mode === "preview" ? "Aperçu du rendu final" : "Composition de la semaine"}</h2><span className="text-[10px] text-muted-foreground">{PLANNING_FORMATS[state.format].label.split(" · ")[0]}</span></div>
        <div className="flex min-h-[420px] items-center justify-center bg-[#090c13] p-5 sm:p-8">
          <canvas ref={canvasRef} width={dimensions.width} height={dimensions.height} role="img" aria-label="Aperçu du planning de la semaine" className={`h-auto w-full shadow-[0_16px_80px_#0008] ${state.format === "story" ? "max-w-[360px]" : state.format === "portrait" ? "max-w-[460px]" : ""}`} />
        </div>
        {previewError && <p role="alert" className="px-4 pb-4 text-sm text-destructive">{previewError}</p>}
        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 px-4 py-3 text-[10px] text-muted-foreground"><span>{dimensions.width} × {dimensions.height} px · PNG / JPG</span><span>{mode === "preview" ? "Rendu final sans outils d’édition" : "La mise en page s’adapte à tes rendez-vous"}</span></footer>
      </section>
      <aside className={`min-w-0 overflow-hidden rounded-2xl border border-border/60 bg-card/60 xl:sticky xl:top-20 ${mode === "preview" ? "hidden" : ""}`} aria-label="Propriétés du planning">
        <header className="border-b border-border/60 px-4 py-3"><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-muted-foreground">Propriétés</p><h2 className="mt-1 text-sm font-medium">{day ? DAY_NAMES[selectedDay] : "La semaine"}</h2></header>
        {day ? <div className="space-y-4 p-4">
          <IconChoices label={`Statut du ${DAY_NAMES[selectedDay].toLowerCase()}`} value={day.status} columns={3} onChange={status => updateDay(selectedDay, { status })} options={[
            { value: "live", label: "Live", icon: Radio },
            { value: "off", label: "Repos", icon: Moon },
            { value: "tba", label: "À annoncer", icon: Clock3 },
          ]} />
          {day.status === "live" ? <div className="space-y-4">
            {day.events.map((event, index) => <PlanningEventEditor key={event.id} event={event} number={index + 1} dayName={DAY_NAMES[selectedDay].toLowerCase()} creator={state.creator} busy={importingImage} canRemove={day.events.length > 1} open={(expandedEvents[selectedDay] ?? day.events[0].id) === event.id} onToggle={() => setExpandedEvents(previous => ({ ...previous, [selectedDay]: (previous[selectedDay] ?? day.events[0].id) === event.id ? "" : event.id }))} onChange={next => updateEvent(selectedDay, event.id, next)} onRemove={() => removeEvent(selectedDay, event.id)} onImage={file => void uploadImage(selectedDay, event.id, file)} />)}
            <Button variant="outline" className="w-full border-dashed" disabled={day.events.length >= 6 || importingImage} onClick={() => addEvent(selectedDay)}><Plus className="mr-2 h-4 w-4" />Ajouter un live</Button><p className="text-[10px] leading-relaxed text-muted-foreground">Jusqu’à 6 lives par jour, affichés dans l’ordre des horaires. PNG, JPG ou WebP · 20 Mo max par image.</p>
          </div> : <p className="text-xs leading-relaxed text-muted-foreground">{day.status === "off" ? "Une journée sans live, affichée comme repos." : "Passe ce jour en Live pour ajouter tes rendez-vous."}</p>}
        </div> : (
          <section aria-label="Réglages du planning" className="space-y-4 p-4">
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
        )}
      </aside>
    </div>
    <p className="text-[11px] leading-relaxed text-muted-foreground">Ton brouillon reste sur cet appareil. Le planning est un visuel à partager ; il ne modifie pas ton planning Twitch. <span className="xl:hidden">{saveStatus}</span></p>
    <Dialog open={resetOpen} onOpenChange={setResetOpen}><DialogContent><DialogHeader><DialogTitle>Vider les rendez-vous ?</DialogTitle><DialogDescription>Les sept jours repasseront à « À annoncer ». Le modèle, les dates et ta signature seront conservés.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setResetOpen(false)}>Garder ma semaine</Button><Button onClick={() => { patch({ days: emptyDays() }); setResetOpen(false) }}>Vider la semaine</Button></DialogFooter></DialogContent></Dialog>
  </div>
}
