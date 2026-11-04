"use client"

import * as React from "react"
import { StudioHeader, StudioModeSwitch, type StudioMode } from "@/components/studio/editor-chrome"
import { Download, ImagePlus, Type, Layers, Palette, Undo2, Redo2, Copy, Trash2, Eye, EyeOff, Lock, LockOpen, ChevronUp, ChevronDown, MousePointer2, Crosshair } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BANNER_FORMATS, defaultTextStyle, renderBranding, type BrandingDesign, type BrandingAsset, type BrandingBox, type BrandingTextStyle } from "@/lib/branding/render"
import { BrandingSchema, initialDesign } from "@/lib/branding/model"
import { readBrandingDraft, saveBrandingDraft } from "@/lib/branding/draft"
import { BrandingStage } from "./branding-stage"
import { useDesignHistory } from "./use-design-history"

const selectStyle = "h-9 w-full rounded-lg border border-input bg-background px-3 text-xs"
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))
function Slider({ label, value, min, max, step = 1, onChange, unit = "" }: { label: string; value: number; min: number; max: number; step?: number; onChange: (value: number) => void; unit?: string }) {
  return <label className="block space-y-2 text-xs text-muted-foreground"><span className="flex justify-between gap-2"><span>{label}</span><span className="tabular-nums text-foreground">{Math.round(value * 100) / 100}{unit}</span></span><input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} className="block w-full accent-primary" /></label>
}

export function BrandingEditor({ kind }: { kind: "banner" | "avatar" }) {
  const avatar = kind === "avatar"
  const history = useDesignHistory({ ...initialDesign, ...(avatar ? { title: "CS", subtitle: "", overlay: 0 } : {}) })
  const { design, setDesign, restore, undo, redo, beginGesture, endGesture } = history
  const [ready, setReady] = React.useState(false)
  const [status, setStatus] = React.useState("Chargement…")
  const [error, setError] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  const [exporting, setExporting] = React.useState(false)
  const [mode, setMode] = React.useState<StudioMode>("edit")
  const [guides, setGuides] = React.useState(false)
  const [selected, setSelected] = React.useState("background")
  const [tab, setTab] = React.useState<"layers" | "design">("layers")
  const [zoom, setZoom] = React.useState(100)
  const [boxes, setBoxes] = React.useState<BrandingBox[]>([])
  const [dragOver, setDragOver] = React.useState(false)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const backgroundInput = React.useRef<HTMLInputElement>(null)
  const assetInput = React.useRef<HTMLInputElement>(null)
  const gestureDesign = React.useRef(design)
  const importInProgress = React.useRef(false)
  const storageKey = `coopstream-studio-${kind}-v1`
  const dimensions = avatar ? { width: 1024, height: 1024 } : BANNER_FORMATS[design.format]
  const shape = avatar ? design.shape ?? "circle" : "square"
  const activeAsset = design.assets.find(asset => asset.id === selected)
  const textKey = selected === "subtitle" ? "subtitleStyle" : "titleStyle"
  const textStyle = design[textKey] ?? defaultTextStyle(avatar, selected === "subtitle")
  const isText = selected === "title" || selected === "subtitle"
  const patch = (value: Partial<BrandingDesign>) => setDesign(previous => ({ ...previous, ...value }))
  const updateAsset = (value: Partial<BrandingAsset>) => setDesign(previous => ({ ...previous, assets: previous.assets.map(asset => asset.id === selected ? { ...asset, ...value } : asset) }))
  const updateText = (value: Partial<BrandingTextStyle>) => patch({ [textKey]: { ...textStyle, ...value } })

  React.useEffect(() => {
    let active = true
    void readBrandingDraft(storageKey).then(raw => { if (!active) return; const parsed = BrandingSchema.safeParse(raw); if (parsed.success) restore({ ...parsed.data, template: "minimal" }) }).catch(() => {}).finally(() => { if (active) setReady(true) })
    return () => { active = false }
    // Restore once per tool; history methods deliberately operate on refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey])

  React.useEffect(() => {
    if (!ready) return
    let active = true
    setStatus("Enregistrement…")
    const timer = window.setTimeout(() => { void saveBrandingDraft(storageKey, design).then(() => { if (active) setStatus("Brouillon enregistré") }).catch(() => { if (active) setStatus("Sauvegarde indisponible · pense à exporter") }) }, 400)
    return () => { active = false; window.clearTimeout(timer) }
  }, [design, ready, storageKey])

  React.useEffect(() => {
    let active = true
    const buffer = document.createElement("canvas")
    void renderBranding(buffer, design, avatar, shape).then(result => {
      if (!active || !canvasRef.current) return
      const canvas = canvasRef.current; canvas.width = buffer.width; canvas.height = buffer.height
      canvas.getContext("2d")?.drawImage(buffer, 0, 0); setBoxes(result); setError("")
    }).catch(() => { if (active) setError("Impossible d’afficher une image. Retire-la ou importe-la à nouveau.") })
    return () => { active = false }
  }, [design, avatar, shape])

  async function upload(files: File[], target: "background" | "asset") {
    if (importInProgress.current) return
    const available = target === "background" ? 1 : 8 - design.assets.length
    if (available <= 0) { toast.info("Tu peux ajouter jusqu’à 8 éléments."); return }
    importInProgress.current = true; setBusy(true)
    if (files.length > available) toast.info(`Seules les ${available} premières images seront importées.`)
    const imported: BrandingAsset[] = []
    try {
      for (const file of files.slice(0, available)) {
        let url: string | undefined
        try {
          if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) throw new Error("Choisis une image PNG, JPG ou WebP.")
          if (file.size > 20 * 1024 * 1024) throw new Error("Choisis une image de moins de 20 Mo.")
          url = URL.createObjectURL(file)
          const source = url
          const image = await new Promise<HTMLImageElement>((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = () => reject(new Error("Image illisible.")); img.src = source })
          const canvas = document.createElement("canvas"), scale = Math.min(1, 2560 / Math.max(image.naturalWidth, image.naturalHeight))
          canvas.width = Math.max(1, Math.round(image.naturalWidth * scale)); canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
          const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Import indisponible.")
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
          const data = canvas.toDataURL("image/png")
          if (data.length > 5000000) throw new Error("Image trop détaillée. Essaie une version plus légère.")
          if (target === "background") { patch({ image: data, zoom: 1, offsetX: 0, offsetY: 0 }); setSelected("background") }
          else imported.push({ id: crypto.randomUUID(), name: file.name.slice(0, 100), image: data, x: 50 + imported.length * 3, y: 50, size: 65, rotation: 0, opacity: 100 })
        } catch (reason) { toast.error(`${file.name} : ${reason instanceof Error ? reason.message : "Import impossible."}`) }
        finally { if (url) URL.revokeObjectURL(url) }
      }
      if (imported.length) { setDesign(previous => ({ ...previous, assets: [...previous.assets, ...imported].slice(0, 8) })); setSelected(imported.at(-1)!.id); setTab("layers") }
    } finally { importInProgress.current = false; setBusy(false) }
  }

  function removeSelected() {
    if (activeAsset && !activeAsset.locked) { patch({ assets: design.assets.filter(asset => asset.id !== selected) }); setSelected("background") }
    else if (isText) { patch({ [selected]: "" }); setSelected("background") }
  }
  function duplicateSelected() {
    if (!activeAsset || design.assets.length >= 8) return
    const copy = { ...activeAsset, id: crypto.randomUUID(), name: `${activeAsset.name.slice(0, 90)} (copie)`, x: clamp(activeAsset.x + 4, 0, 100), y: clamp(activeAsset.y + 4, 0, 100), locked: false }
    patch({ assets: [...design.assets, copy] }); setSelected(copy.id)
  }
  function reorder(direction: number) {
    const assets = [...design.assets], index = assets.findIndex(asset => asset.id === selected), next = index + direction
    if (index < 0 || next < 0 || next >= assets.length) return
    const item = assets[index]; assets[index] = assets[next]; assets[next] = item; patch({ assets })
  }
  function transform(id: string, change: { x?: number; y?: number; scale?: number }) {
    const base = gestureDesign.current
    if (id === "title" || id === "subtitle") {
      const key = id === "title" ? "titleStyle" : "subtitleStyle", start = base[key] ?? defaultTextStyle(avatar, id === "subtitle")
      patch({ [key]: { ...start, ...(change.scale !== undefined ? { size: clamp(start.size * change.scale, 5, 300) } : change) } })
    } else {
      const start = base.assets.find(asset => asset.id === id)
      if (!start || start.locked) return
      setDesign(previous => ({ ...previous, assets: previous.assets.map(asset => asset.id === id ? { ...asset, ...(change.scale !== undefined ? { size: clamp(start.size * change.scale, 5, 200) } : change) } : asset) }))
    }
  }
  function keyboard(event: React.KeyboardEvent) {
    if (mode === "preview") return
    const target = event.target as HTMLElement
    if (target.closest("input,textarea,select,[contenteditable=true]")) return
    const key = event.key.toLowerCase(), mod = event.ctrlKey || event.metaKey
    if (mod && key === "z") { event.preventDefault(); if (event.shiftKey) redo(); else undo(); return }
    if (mod && key === "y") { event.preventDefault(); redo(); return }
    if (mod && key === "d") { event.preventDefault(); duplicateSelected(); return }
    if (key === "escape") { setSelected("background"); return }
    if (key === "delete" || key === "backspace") { event.preventDefault(); removeSelected(); return }
    if (["arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key) && (isText || (activeAsset && !activeAsset.locked))) {
      event.preventDefault(); const value = activeAsset ?? textStyle, step = event.shiftKey ? 2 : .2
      const change = { x: clamp(value.x + (key === "arrowleft" ? -step : key === "arrowright" ? step : 0), 0, 100), y: clamp(value.y + (key === "arrowup" ? -step : key === "arrowdown" ? step : 0), 0, 100) }
      if (isText) updateText(change); else updateAsset(change)
    }
  }
  async function download() {
    setExporting(true)
    try {
      const canvas = document.createElement("canvas"); await renderBranding(canvas, design, avatar, shape)
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error()), "image/png"))
      const url = URL.createObjectURL(blob), link = document.createElement("a"); link.href = url; link.download = `${avatar ? `photo-profil-${shape === "circle" ? "ronde" : shape === "rounded" ? "arrondie" : "carree"}` : "banniere"}-${canvas.width}x${canvas.height}.png`; link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      toast.success("Visuel exporté en PNG")
    } catch { toast.error("L’export a échoué. Réessaie.") } finally { setExporting(false) }
  }

  const rows = [ ...(design.subtitle && !avatar ? [{ id: "subtitle", label: "Signature", caption: design.subtitle }] : []), ...(design.title ? [{ id: "title", label: "Titre", caption: design.title }] : []), ...[...design.assets].reverse().map(asset => ({ id: asset.id, label: asset.name, caption: asset.hidden ? "Masqué" : asset.locked ? "Verrouillé" : "Image", asset })), { id: "background", label: "Arrière-plan", caption: design.image ? "Image de fond" : "Couleur & ambiance" } ]
  return <div className="space-y-4 outline-none" onKeyDown={keyboard} tabIndex={-1} data-testid="branding-editor">
    <input ref={backgroundInput} type="file" accept="image/png,image/jpeg,image/webp" aria-label="Importer un fond" className="hidden" onChange={e => { const files = Array.from(e.target.files ?? []); e.target.value = ""; void upload(files, "background") }} />
    <input ref={assetInput} type="file" multiple accept="image/png,image/jpeg,image/webp" aria-label="Importer des éléments" className="hidden" onChange={e => { const files = Array.from(e.target.files ?? []); e.target.value = ""; void upload(files, "asset") }} />
    <StudioHeader title={avatar ? "Photo de profil" : "Créateur de bannières"} section="Identité" status={status}>
      <Button variant="outline" size="icon" aria-label="Annuler" title="Annuler · Ctrl Z" disabled={!history.canUndo} onClick={undo}><Undo2 className="h-4 w-4" /></Button>
      <Button variant="outline" size="icon" aria-label="Rétablir" title="Rétablir · Ctrl Maj Z" disabled={!history.canRedo} onClick={redo}><Redo2 className="h-4 w-4" /></Button>
      <Button disabled={!ready || busy || exporting || Boolean(error)} onClick={() => void download()}><Download className="mr-2 h-4 w-4" />{exporting ? "Export…" : "Exporter PNG"}</Button>
    </StudioHeader>
    <div className="flex flex-wrap items-center justify-between gap-3"><StudioModeSwitch value={mode} onChange={setMode} />{avatar && <div role="group" aria-label="Forme du profil" className="inline-flex rounded-xl border border-border/60 bg-card/60 p-1">{([['circle', 'Cercle'], ['rounded', 'Carré arrondi'], ['square', 'Carré']] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={shape === value} onClick={() => patch({ shape: value })} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition ${shape === value ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted"}`}><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4 shrink-0">{value === "circle" ? <circle cx="12" cy="12" r="9" /> : <rect x="3" y="3" width="18" height="18" rx={value === "rounded" ? 5 : 0} />}</svg>{label}</button>)}</div>}</div>
    <div className={`grid items-start gap-3 ${mode === "edit" ? "xl:grid-cols-[220px_minmax(0,1fr)_260px]" : "mx-auto max-w-[1200px]"}`}>
      <aside className={`overflow-hidden rounded-2xl border border-border/60 bg-card/60 xl:sticky xl:top-20 ${mode === "preview" ? "hidden" : ""}`}>
        <div className="grid grid-cols-2 border-b border-border/60 p-2">{([['layers', 'Calques', Layers], ['design', 'Design', Palette]] as const).map(([id, label, Icon]) => <button key={id} onClick={() => setTab(id)} aria-pressed={tab === id} className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${tab === id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}><Icon className="h-3.5 w-3.5" />{label}</button>)}</div>
        {tab === "layers" ? <div className="space-y-4 p-3">
          <div className="grid grid-cols-2 gap-2"><Button size="sm" variant="outline" disabled={busy || design.assets.length >= 8} onClick={() => assetInput.current?.click()}><ImagePlus className="mr-1 h-3.5 w-3.5" />Image</Button><Button size="sm" variant="outline" onClick={() => { if (!design.title) patch({ title: "Ton texte" }); setSelected("title") }}><Type className="mr-1 h-3.5 w-3.5" />Texte</Button></div>
          {!avatar && !design.subtitle && <Button size="sm" variant="ghost" className="w-full" onClick={() => { patch({ subtitle: "Ta signature" }); setSelected("subtitle") }}>Ajouter une signature</Button>}
          <div className="space-y-1" aria-label="Calques de la composition">{rows.map(row => <button key={row.id} data-testid={`layer-${row.id}`} onClick={() => setSelected(row.id)} aria-pressed={selected === row.id} className={`flex w-full items-center gap-2.5 rounded-xl border p-2.5 text-left transition ${selected === row.id ? "border-primary/50 bg-primary/10" : "border-transparent hover:bg-muted/60"}`}><span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/50 bg-muted/50">{'asset' in row && row.asset ? <span className="h-full w-full bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url(${row.asset.image})` }} /> : row.id === "background" ? <Palette className="h-4 w-4 text-muted-foreground" /> : <Type className="h-4 w-4 text-muted-foreground" />}</span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-medium">{row.label}</span><span className="block truncate text-[10px] text-muted-foreground">{row.caption}</span></span>{'asset' in row && row.asset?.locked && <Lock className="h-3 w-3 shrink-0 text-muted-foreground" />}</button>)}</div>
          <p className="px-1 text-[10px] leading-relaxed text-muted-foreground">Le premier calque apparaît devant les autres. Glisse tes images sur la composition pour les ajouter.</p>
        </div> : <div className="space-y-5 p-4">
          {!avatar && <label className="block space-y-2 text-xs text-muted-foreground">Format<select className={selectStyle} value={design.format} onChange={e => patch({ format: e.target.value as BrandingDesign["format"] })}>{Object.entries(BANNER_FORMATS).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</select></label>}
          <div><p className="mb-2 text-xs text-muted-foreground">Ambiance</p><div className="flex items-center gap-3 rounded-xl border border-primary/50 bg-primary/10 p-3 text-xs"><span className="h-6 w-9 rounded border border-white/10" style={{ background: design.background }} />Épuré</div></div>
          {([['accent', 'Accent'], ['background', 'Fond']] as const).map(([key, label]) => <label key={key} className="flex items-center justify-between text-xs text-muted-foreground">{label}<input aria-label={label} type="color" value={design[key]} onChange={e => patch({ [key]: e.target.value })} className="h-8 w-12 rounded border border-input bg-transparent p-1" /></label>)}
          {avatar && <label className="flex items-center gap-2 text-xs text-muted-foreground"><input type="checkbox" checked={design.transparent} onChange={e => patch({ transparent: e.target.checked })} className="accent-primary" />Fond transparent</label>}
        </div>}
      </aside>
      <section className={`min-w-0 overflow-hidden rounded-2xl border bg-card/40 ${dragOver ? "border-primary ring-2 ring-primary/30" : "border-border/60"}`} onDragOver={e => { e.preventDefault(); if (mode === "edit" && e.dataTransfer.types.includes("Files")) setDragOver(true) }} onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(false) }} onDrop={e => { e.preventDefault(); setDragOver(false); if (mode === "edit") void upload(Array.from(e.dataTransfer.files), "asset") }}>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 px-4 py-3"><span className="inline-flex items-center gap-2 text-xs text-muted-foreground">{mode === "preview" ? <Eye className="h-3.5 w-3.5 text-primary" /> : <MousePointer2 className="h-3.5 w-3.5 text-primary" />}{busy ? "Import des images…" : mode === "preview" ? "Aperçu du rendu final" : "Sélectionne · déplace · redimensionne"}</span><div className="flex items-center gap-3">{mode === "edit" && <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><input type="checkbox" checked={guides} onChange={e => setGuides(e.target.checked)} className="accent-primary" />Repères</label>}<select aria-label="Zoom de l’espace de travail" value={zoom} onChange={e => setZoom(Number(e.target.value))} className="rounded-md border border-border bg-background px-2 py-1 text-[11px]">{[50, 75, 100, 150, 200].map(value => <option key={value} value={value}>{value === 100 ? "Ajuster" : `${value} %`}</option>)}</select></div></div>
        <BrandingStage canvasRef={canvasRef} boxes={boxes} selected={selected} onSelect={setSelected} onChange={transform} onStart={() => { gestureDesign.current = design; beginGesture() }} onEnd={endGesture} shape={shape} guides={guides} avatar={avatar} zoom={zoom} preview={mode === "preview"} />
        {dragOver && <p className="bg-primary/10 p-3 text-center text-xs text-primary">Dépose tes images pour les ajouter comme éléments</p>}
        {error && <p role="alert" className="px-4 py-3 text-sm text-destructive">{error}</p>}
        <div className="flex flex-wrap justify-between gap-2 border-t border-border/60 px-4 py-3 text-[10px] text-muted-foreground"><span>{dimensions.width} × {dimensions.height} px · PNG</span><span>{mode === "preview" ? avatar && shape !== "square" ? "Découpe appliquée · coins transparents" : "Rendu final sans repères" : "Flèches : déplacer · Suppr : retirer · Ctrl D : dupliquer"}</span></div>
      </section>
      <aside className={`overflow-hidden rounded-2xl border border-border/60 bg-card/60 xl:sticky xl:top-20 ${mode === "preview" ? "hidden" : ""}`} aria-label="Propriétés de la sélection">
        <div className="border-b border-border/60 px-4 py-3"><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-muted-foreground">Propriétés</p><h2 className="mt-1 truncate text-sm font-medium">{activeAsset?.name ?? (selected === "title" ? "Titre" : selected === "subtitle" ? "Signature" : "Arrière-plan")}</h2></div>
        <div className="space-y-5 p-4">
          {isText ? <><label className="block space-y-2 text-xs text-muted-foreground">Texte<Input aria-label="Texte sélectionné" maxLength={selected === "title" ? 60 : 100} value={selected === "title" ? design.title : design.subtitle} onChange={e => patch({ [selected]: e.target.value })} /></label><label className="flex items-center justify-between text-xs text-muted-foreground">Couleur<input aria-label="Couleur du texte" type="color" value={textStyle.color} onChange={e => updateText({ color: e.target.value })} className="h-8 w-12 rounded border border-input bg-transparent p-1" /></label><Slider label="Taille du texte" value={textStyle.size} min={5} max={300} unit=" %" onChange={size => updateText({ size })} /><Slider label="Rotation" value={textStyle.rotation} min={-180} max={180} unit="°" onChange={rotation => updateText({ rotation })} /></> : activeAsset ? <>
            <label className="block space-y-2 text-xs text-muted-foreground">Nom du calque<Input aria-label="Nom du calque" maxLength={100} value={activeAsset.name} onChange={e => updateAsset({ name: e.target.value })} /></label>
            <div className="grid grid-cols-2 gap-2"><Button size="sm" variant="outline" aria-pressed={Boolean(activeAsset.hidden)} onClick={() => updateAsset({ hidden: !activeAsset.hidden })}>{activeAsset.hidden ? <EyeOff className="mr-1.5 h-3.5 w-3.5" /> : <Eye className="mr-1.5 h-3.5 w-3.5" />}{activeAsset.hidden ? "Afficher" : "Masquer"}</Button><Button size="sm" variant="outline" aria-pressed={Boolean(activeAsset.locked)} onClick={() => updateAsset({ locked: !activeAsset.locked })}>{activeAsset.locked ? <Lock className="mr-1.5 h-3.5 w-3.5" /> : <LockOpen className="mr-1.5 h-3.5 w-3.5" />}{activeAsset.locked ? "Libérer" : "Verrouiller"}</Button></div>
            <fieldset disabled={activeAsset.locked} className="space-y-5 disabled:opacity-40"><Slider label="Taille" value={activeAsset.size} min={5} max={200} unit=" %" onChange={size => updateAsset({ size })} /><Slider label="Rotation" value={activeAsset.rotation} min={-180} max={180} unit="°" onChange={rotation => updateAsset({ rotation })} /><Slider label="Opacité" value={activeAsset.opacity} min={0} max={100} unit=" %" onChange={opacity => updateAsset({ opacity })} /></fieldset>
            <div className="grid grid-cols-2 gap-2"><Button size="sm" variant="outline" disabled={design.assets.at(-1)?.id === selected} onClick={() => reorder(1)}><ChevronUp className="mr-1 h-3.5 w-3.5" />Avancer</Button><Button size="sm" variant="outline" disabled={design.assets[0]?.id === selected} onClick={() => reorder(-1)}><ChevronDown className="mr-1 h-3.5 w-3.5" />Reculer</Button></div>
          </> : <><Button className="w-full" variant="outline" disabled={busy} onClick={() => backgroundInput.current?.click()}><ImagePlus className="mr-2 h-4 w-4" />{design.image ? "Changer le fond" : "Importer un fond"}</Button>{design.image ? <><Slider label="Zoom du fond" value={design.zoom} min={1} max={3} step={.01} onChange={zoom => patch({ zoom })} /><Slider label="Cadrage horizontal" value={design.offsetX} min={-100} max={100} onChange={offsetX => patch({ offsetX })} /><Slider label="Cadrage vertical" value={design.offsetY} min={-100} max={100} onChange={offsetY => patch({ offsetY })} /><Slider label="Assombrir" value={design.overlay} min={0} max={80} unit=" %" onChange={overlay => patch({ overlay })} /><Button size="sm" variant="ghost" onClick={() => patch({ image: "" })}>Retirer le fond</Button></> : <p className="text-xs leading-relaxed text-muted-foreground">Choisis une ambiance et tes couleurs dans Design, ou importe une image de fond.</p>}</>}
          {(isText || activeAsset) && <><fieldset disabled={activeAsset?.locked} className="space-y-4 border-t border-border/60 pt-4 disabled:opacity-40"><legend className="sr-only">Position</legend><div className="grid grid-cols-2 gap-2">{(['x', 'y'] as const).map(axis => <label key={axis} className="space-y-1 text-[10px] uppercase text-muted-foreground">{axis} (%)<Input aria-label={`Position ${axis}`} type="number" min={0} max={100} step={.1} value={Math.round((activeAsset ?? textStyle)[axis] * 10) / 10} onChange={e => { if (e.target.value === "") return; const change = { [axis]: clamp(Number(e.target.value), 0, 100) }; if (isText) updateText(change); else updateAsset(change) }} /></label>)}</div><Button size="sm" variant="outline" className="w-full" onClick={() => isText ? updateText({ x: 50, y: 50 }) : updateAsset({ x: 50, y: 50 })}><Crosshair className="mr-2 h-3.5 w-3.5" />Centrer sur le visuel</Button></fieldset><div className="flex gap-2 border-t border-border/60 pt-4">{activeAsset && <Button size="sm" variant="outline" disabled={design.assets.length >= 8} onClick={duplicateSelected}><Copy className="mr-1.5 h-3.5 w-3.5" />Dupliquer</Button>}<Button size="sm" variant="ghost" disabled={activeAsset?.locked} className="text-destructive hover:text-destructive" onClick={removeSelected}><Trash2 className="mr-1.5 h-3.5 w-3.5" />Retirer</Button></div></>}
        </div>
      </aside>
    </div>
    <p className="text-[11px] leading-relaxed text-muted-foreground">{avatar ? shape !== "square" ? "La découpe est identique en édition, en aperçu et à l’export. Les coins du PNG sont transparents." : "Export carré : toute la composition est conservée." : "Les repères et les cadres de sélection ne sont pas exportés. Vérifie le recadrage sur le réseau lors de la mise en ligne."} <span className="xl:hidden">{status}</span></p>
  </div>
}
