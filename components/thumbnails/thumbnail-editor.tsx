"use client"

import * as React from "react"
import Image from "next/image"
import { StudioHeader, StudioModeSwitch, type StudioMode } from "@/components/studio/editor-chrome"
import {
  Download,
  Undo2,
  Redo2,
  FilePlus2,
  Check,
  ImageIcon,
  Layers,
  Lock,
  LockOpen,
  Eye,
  EyeOff,
  ChevronDown,
  Settings2,
  ImagePlus,
  Palette,
  Plus,
  Scissors,
  Sparkles,
  Trash2,
  Type,
  User,
} from "lucide-react"
import { toast } from "sonner"

import { StudioPreview } from "@/components/thumbnails/studio-preview"
import { createStudioState, createBlankState } from "@/lib/thumbnails/studio"
import { readDraft, saveDraft } from "@/lib/thumbnails/draft"
import { ThumbnailStage } from "@/components/thumbnails/thumbnail-stage"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  BADGE_PRESETS,
  IMAGE_LAYER_LABELS,
  IMAGE_LAYER_STACK,
  THUMBNAIL_DEMO_BACKGROUNDS,
  THUMBNAIL_DEMO_HEADS,
  THUMBNAIL_DEMO_PROPS,
  THUMBNAIL_FONTS,
  THUMBNAIL_TEMPLATES,
  composeThumbnailToCanvas,
  createBadgeItem,
  createTextItem,
  cutoutDarkBackground,
  ensureAllThumbnailFonts,
  ensureThumbnailFont,
  exportThumbnailPng,
  getThumbnailFont,
  isImageLayerId,
  type BadgeVariant,
  type ImageLayerId,
  type RelRect,
  type SelectedId,
  type TextItem,
  type ThumbnailEditorState,
  type ThumbnailEffects,
} from "@/lib/thumbnails"

const STORAGE_KEY = "coopstream-thumbnail-editor-v11"

type PanelTab = "layers" | "edit" | "media" | "effects"

function FileOrDemo({ label, icon, demos, currentUrl, onUrl, extra }: {
  label: string; icon: React.ReactNode; demos: ReadonlyArray<{ id: string; label: string; url: string }>
  currentUrl: string | null; onUrl: (url: string | null) => void; extra?: React.ReactNode
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  return <section className="space-y-3" aria-label={label}>
    <h3 className="flex items-center gap-2 text-sm font-medium">{icon}{label}</h3>
    <div className="overflow-hidden rounded-xl border border-border/60 bg-background/30">
      {currentUrl && <div className="relative h-28 bg-muted/30"><Image src={currentUrl} alt={`Visuel : ${label}`} fill unoptimized className="object-contain p-2" /></div>}
      <div className="flex items-center gap-1 bg-muted/20 p-2"><Button type="button" size="sm" variant="ghost" className="min-w-0 flex-1" onClick={() => inputRef.current?.click()}><ImagePlus className="mr-1.5 h-3.5 w-3.5" />{currentUrl ? "Changer" : "Importer une image"}</Button>{currentUrl && <Button type="button" size="sm" variant="ghost" className="h-8 w-8 shrink-0 p-0 text-muted-foreground hover:text-destructive" aria-label={`Retirer ${label}`} title={`Retirer ${label}`} onClick={() => onUrl(null)}><Trash2 className="h-3.5 w-3.5" /></Button>}</div>
      <input ref={inputRef} type="file" accept="image/*" aria-label={`Importer ${label}`} className="hidden" onChange={e => {
        const file = e.target.files?.[0]; e.target.value = ""; if (!file) return
        if (file.size > 15 * 1024 * 1024) { toast.error("Choisis une image de moins de 15 Mo"); return }
        const reader = new FileReader()
        reader.onload = () => { if (typeof reader.result === "string") onUrl(reader.result) }
        reader.onerror = () => toast.error("Image impossible à lire")
        reader.readAsDataURL(file)
      }} />
    </div>
    <details className="group rounded-xl border border-border/50 bg-background/20">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 p-3 text-[11px] font-medium text-muted-foreground hover:text-foreground [&::-webkit-details-marker]:hidden">Visuels de démonstration<ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" /></summary>
      <div className="flex flex-wrap gap-2 px-3 pb-3">{demos.map(demo => <Button key={demo.id} type="button" size="sm" variant={currentUrl === demo.url ? "default" : "outline"} aria-pressed={currentUrl === demo.url} onClick={() => onUrl(demo.url)}>{demo.label}</Button>)}</div>
    </details>
    {extra}
  </section>
}

function TextControls({
  item,
  onChange,
  onDelete,
}: {
  item: TextItem
  onChange: (next: TextItem) => void
  onDelete: () => void
}) {
  const patch = (partial: Partial<TextItem>) => onChange({ ...item, ...partial })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-semibold">
          {item.kind === "badge" ? "Badge" : "Texte"}
        </div>
        <Button type="button" size="sm" variant="destructive" onClick={onDelete}>
          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
          Supprimer
        </Button>
      </div>

      {item.kind === "text" && <div className="grid grid-cols-3 gap-2">{[
        { label: "Contour", color: "transparent", stroke: "#ffffff", mode: "outline" as const },
        { label: "Blanc", color: "#ffffff", stroke: "transparent", mode: "solid" as const },
        { label: "Lavande", color: "#d8b4fe", stroke: "transparent", mode: "solid" as const },
      ].map(style => <button type="button" key={style.label} onClick={() => patch({ color: style.color, stroke: style.stroke, fillMode: style.mode, strokeWidth: style.mode === "outline" ? 2.5 : 0, fontId: "lecalme", italic: true, tightTracking: true })} className="rounded-lg border border-primary/20 bg-primary/5 px-2 py-3 text-xs font-black uppercase italic text-foreground hover:bg-primary/15">{style.label}</button>)}</div>}

      <Input
        aria-label="Contenu du texte"
        value={item.text}
        onChange={(e) => patch({ text: e.target.value })}
        placeholder={item.kind === "badge" ? "Label badge" : "Texte"}
        className="h-10 text-base"
      />

      <details className="group rounded-xl border border-border/60 bg-background/30">
        <summary className="flex cursor-pointer list-none items-center gap-2 p-3 text-xs font-medium text-muted-foreground hover:text-foreground [&::-webkit-details-marker]:hidden"><Settings2 className="h-3.5 w-3.5" />Réglages avancés<ChevronDown className="ml-auto h-3.5 w-3.5 transition-transform group-open:rotate-180" /></summary>
        <div className="space-y-4 border-t border-border/50 p-3">
      <label className="block text-xs text-muted-foreground">Ombre du texte ({Math.round((item.shadow ?? .75) * 100)}%)<input type="range" min={0} max={1} step={.05} value={item.shadow ?? .75} onChange={e => patch({ shadow: Number(e.target.value) })} className="mt-2 w-full" /></label>
      {item.kind === "badge" ? (
        <div className="space-y-2">
          <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Type de badge
          </div>
          <div className="grid grid-cols-3 gap-2">
            {BADGE_PRESETS.map((b) => {
              const active = item.badgeVariant === b.id
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() =>
                    patch({
                      badgeVariant: b.id,
                      text: b.label,
                      color: b.fg,
                    })
                  }
                  className={[
                    "rounded-lg border px-2 py-2.5 text-center text-xs font-bold tracking-wide transition",
                    active ? "ring-2 ring-white/80 ring-offset-2 ring-offset-background" : "",
                  ].join(" ")}
                  style={{
                    background: b.bg,
                    color: b.fg,
                    borderColor: "transparent",
                  }}
                >
                  {b.label}
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Police · {getThumbnailFont(item.fontId).label}
            </div>
            <div className="grid max-h-52 grid-cols-2 gap-2 overflow-y-auto pr-1">
              {THUMBNAIL_FONTS.map((font) => {
                const active = item.fontId === font.id
                return (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => {
                      void ensureThumbnailFont(font.id)
                      patch({ fontId: font.id })
                    }}
                    className={[
                      "rounded-lg border px-2.5 py-2.5 text-left transition",
                      active
                        ? "border-primary bg-primary/10 ring-1 ring-primary/40"
                        : "border-border/70 bg-background/50 hover:border-border",
                    ].join(" ")}
                  >
                    <div
                      className="truncate text-[18px] leading-tight"
                      style={{
                        fontFamily: font.stack,
                        fontWeight: font.weight,
                        fontStyle: item.italic ? "italic" : "normal",
                      }}
                    >
                      {font.sample ?? "Aa"}
                    </div>
                    <div className="mt-1 truncate text-[10px] text-muted-foreground">
                      {font.label}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={item.fillMode === "outline" ? "default" : "outline"}
              onClick={() =>
                patch({
                  fillMode: "outline",
                  fontId: "lecalme",
                  color: "transparent",
                  stroke: "rgba(255,255,255,0.92)",
                  strokeWidth: 2.5,
                  italic: true,
                  tightTracking: true,
                })
              }
            >
              Style intro
            </Button>
            <Button
              type="button"
              size="sm"
              variant={item.fillMode === "solid" ? "default" : "outline"}
              onClick={() =>
                patch({
                  fillMode: "solid",
                  color:
                    item.color === "transparent" ? "#ffffff" : item.color,
                })
              }
            >
              Plein
            </Button>
            <Button
              type="button"
              size="sm"
              variant={item.italic ? "default" : "outline"}
              onClick={() => patch({ italic: !item.italic })}
            >
              Italique
            </Button>
            <Button
              type="button"
              size="sm"
              variant={item.uppercase ? "default" : "outline"}
              onClick={() => patch({ uppercase: !item.uppercase })}
            >
              MAJUSCULES
            </Button>
            <Button
              type="button"
              size="sm"
              variant={item.tightTracking ? "default" : "outline"}
              onClick={() => patch({ tightTracking: !item.tightTracking })}
            >
              Tracking serré
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {(["left", "center", "right"] as const).map((align) => (
              <Button
                key={align}
                type="button"
                size="sm"
                variant={item.align === align ? "default" : "outline"}
                onClick={() => patch({ align })}
              >
                {align === "left"
                  ? "Gauche"
                  : align === "center"
                    ? "Centre"
                    : "Droite"}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="text-[11px] text-muted-foreground">
              Couleur
              <Input
                type="color"
                value={item.color.startsWith("#") ? item.color : "#ffffff"}
                onChange={(e) => patch({ color: e.target.value })}
                className="mt-1 h-10 w-full p-1"
              />
            </label>
            <label className="text-[11px] text-muted-foreground">
              Contour
              <Input
                type="color"
                value={item.stroke.startsWith("#") ? item.stroke : "#000000"}
                onChange={(e) => patch({ stroke: e.target.value })}
                className="mt-1 h-10 w-full p-1"
              />
            </label>
          </div>

          <label className="block text-[11px] text-muted-foreground">
            Épaisseur contour ({item.strokeWidth}px)
            <input
              type="range"
              min={0}
              max={24}
              step={1}
              value={item.strokeWidth}
              onChange={(e) =>
                patch({ strokeWidth: Number(e.target.value) })
              }
              className="mt-1 w-full"
            />
          </label>
        </>
      )}
        </div>
      </details>

      <label className="block text-[11px] text-muted-foreground">
        Taille × {item.sizeScale.toFixed(2)}
        <input
          type="range"
          min={0.5}
          max={2.4}
          step={0.02}
          value={item.sizeScale}
          onChange={(e) => patch({ sizeScale: Number(e.target.value) })}
          className="mt-1 w-full"
        />
      </label>
    </div>
  )
}

const PANEL_TABS: {
  id: PanelTab
  label: string
  icon: React.ReactNode
}[] = [
  { id: "layers", label: "Calques", icon: <Layers className="h-3.5 w-3.5" /> },
  { id: "edit", label: "Édition", icon: <Type className="h-3.5 w-3.5" /> },
  { id: "media", label: "Médias", icon: <ImageIcon className="h-3.5 w-3.5" /> },
  { id: "effects", label: "Effets", icon: <Palette className="h-3.5 w-3.5" /> },
]

export function ThumbnailEditor() {
  const [state, setState] = React.useState<ThumbnailEditorState>(() =>
    createStudioState("signature"),
  )
  const [selected, setSelected] = React.useState<SelectedId | null>(() => {
    return null
  })
  const [panel, setPanel] = React.useState<PanelTab>("media")
  const [exporting, setExporting] = React.useState(false)
  const [cutting, setCutting] = React.useState(false)
  const [mode, setMode] = React.useState<StudioMode>("edit")
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const drawGen = React.useRef(0)

  React.useEffect(() => {
    void ensureAllThumbnailFonts()
  }, [])

  const [ready, setReady] = React.useState(false)
  const [saveStatus, setSaveStatus] = React.useState("Chargement…")
  const [history, setHistory] = React.useState<ThumbnailEditorState[]>([])
  const [future, setFuture] = React.useState<ThumbnailEditorState[]>([])
  const lastSnapshot = React.useRef(state)
  const skipHistory = React.useRef(false)
  const [mobilePreview, setMobilePreview] = React.useState(false)
  const [blankOpen, setBlankOpen] = React.useState(false)

  React.useEffect(() => {
    let active = true
    void readDraft().then((draft) => {
      if (!active) return
      if (draft?.layers && Array.isArray(draft.texts)) {
        setState(draft)
        lastSnapshot.current = draft
        setSelected(draft.texts[0]?.id ?? null)
      } else {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        if (raw) {
          const old = JSON.parse(raw) as Partial<ThumbnailEditorState>
          setState(prev => { const migrated = { ...prev, ...old }; lastSnapshot.current = migrated; return migrated })
        }
      }
    }).catch(() => {}).finally(() => { if (active) setReady(true) })
    return () => { active = false }
  }, [])

  React.useEffect(() => {
    if (!ready) return
    setSaveStatus("Enregistrement…")
    const timer = window.setTimeout(() => {
      void saveDraft(state).then(() => setSaveStatus("Brouillon enregistré")).catch(() => setSaveStatus("Sauvegarde indisponible"))
    }, 450)
    return () => window.clearTimeout(timer)
  }, [state, ready])

  React.useEffect(() => {
    if (!ready) return
    if (skipHistory.current) { skipHistory.current = false; lastSnapshot.current = state; return }
    const timer = window.setTimeout(() => {
      if (lastSnapshot.current === state) return
      const snapshot = lastSnapshot.current
      setHistory(prev => [...prev.slice(-39), snapshot])
      setFuture([])
      lastSnapshot.current = state
    }, 300)
    return () => window.clearTimeout(timer)
  }, [state, ready])

  const undo = React.useCallback(() => {
    // Group pointer moves and consecutive keystrokes into one undo step.
    const pending = lastSnapshot.current !== state
    const previous = pending ? lastSnapshot.current : history.at(-1)
    if (!previous) return
    skipHistory.current = true
    setFuture(prev => [...prev, state])
    if (!pending) setHistory(prev => prev.slice(0, -1))
    setState(previous)
  }, [history, state])
  const redo = React.useCallback(() => {
    const next = future.at(-1)
    if (!next) return
    skipHistory.current = true
    setHistory(prev => [...prev, state])
    setFuture(prev => prev.slice(0, -1))
    setState(next)
  }, [future, state])

  React.useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (mode === "preview" || !(event.ctrlKey || event.metaKey)) return
      const target = event.target as HTMLElement
      if (target.closest("input,textarea,[contenteditable=true]")) return
      if (event.key.toLowerCase() === "z") { event.preventDefault(); if (event.shiftKey) redo(); else undo() }
      if (event.key.toLowerCase() === "y") { event.preventDefault(); redo() }
    }
    window.addEventListener("keydown", key)
    return () => window.removeEventListener("keydown", key)
  }, [undo, redo, mode])

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gen = ++drawGen.current
    const buffer = document.createElement("canvas")
    void composeThumbnailToCanvas(buffer, { state }).then(() => {
      if (gen !== drawGen.current) return
      canvas.width = buffer.width
      canvas.height = buffer.height
      canvas.getContext("2d")?.drawImage(buffer, 0, 0)
    }).catch(() => {})
  }, [state])

  const patch = React.useCallback((partial: Partial<ThumbnailEditorState>) => {
    setState((prev) => ({ ...prev, ...partial }))
  }, [])

  const patchEffects = (partial: Partial<ThumbnailEffects>) =>
    setState((prev) => ({
      ...prev,
      effects: { ...prev.effects, ...partial },
    }))

  const onRectChange = React.useCallback((id: SelectedId, rect: RelRect) => {
    setState((prev) => {
      if (isImageLayerId(id)) {
        return {
          ...prev,
          layers: {
            ...prev.layers,
            [id]: { ...prev.layers[id], rect },
          },
        }
      }
      return {
        ...prev,
        texts: prev.texts.map((t) => (t.id === id ? { ...t, rect } : t)),
      }
    })
  }, [])

  const selectItem = React.useCallback((id: SelectedId | null) => {
    setSelected(id)
    if (id && !isImageLayerId(id)) setPanel("edit")
  }, [])

  const patchImageLayer = (
    id: ImageLayerId,
    partial: Partial<ThumbnailEditorState["layers"][ImageLayerId]>,
  ) => {
    setState((prev) => ({
      ...prev,
      layers: {
        ...prev.layers,
        [id]: { ...prev.layers[id], ...partial },
      },
    }))
  }

  const updateText = (id: string, next: TextItem) => {
    setState((prev) => ({
      ...prev,
      texts: prev.texts.map((t) => (t.id === id ? next : t)),
    }))
  }

  const addText = () => {
    const item = createTextItem({
      text: "NOUVEAU TEXTE",
      rect: {
        x: 0.08 + state.texts.length * 0.03,
        y: 0.25 + state.texts.length * 0.04,
        w: 0.42,
        h: 0.22,
      },
    })
    setState((prev) => ({ ...prev, texts: [...prev.texts, item] }))
    setSelected(item.id)
    setPanel("edit")
  }

  const addBadge = (variant: BadgeVariant) => {
    const offset = state.texts.filter((t) => t.kind === "badge").length
    const item = createBadgeItem(variant, {
      x: 0.04 + offset * 0.04,
      y: 0.05 + offset * 0.1,
      w: 0.22,
      h: 0.09,
    })
    setState((prev) => ({ ...prev, texts: [...prev.texts, item] }))
    setSelected(item.id)
    setPanel("edit")
  }

  const deleteText = (id: string) => {
    setState((prev) => ({
      ...prev,
      texts: prev.texts.filter((t) => t.id !== id),
    }))
    setSelected((cur) => (cur === id ? "head" : cur))
    setPanel("layers")
  }

  const onExport = async () => {
    setExporting(true)
    try {
      await exportThumbnailPng(state)
      toast.success("Miniature exportée (PNG 1280×720)")
    } catch {
      toast.error("Export impossible")
    } finally {
      setExporting(false)
    }
  }

  const onCutoutHead = async () => {
    if (!state.headUrl) {
      toast.error("Importe d’abord une tête")
      return
    }
    setCutting(true)
    try {
      const dataUrl = await cutoutDarkBackground(state.headUrl)
      patch({ headUrl: dataUrl })
      toast.success("Fond sombre détouré")
    } catch {
      toast.error("Détourage impossible")
    } finally {
      setCutting(false)
    }
  }

  const selectedText =
    selected && !isImageLayerId(selected)
      ? (state.texts.find((t) => t.id === selected) ?? null)
      : null

  return (
    <div className="thumbnail-studio space-y-4">
      <StudioHeader title="Miniatures YouTube" section="Miniatures" status={saveStatus}>
        <Button variant="outline" size="icon" aria-label="Annuler" title="Annuler · Ctrl Z" onClick={undo} disabled={!history.length && lastSnapshot.current === state}><Undo2 className="h-4 w-4" /></Button>
        <Button variant="outline" size="icon" aria-label="Rétablir" title="Rétablir · Ctrl Maj Z" onClick={redo} disabled={!future.length}><Redo2 className="h-4 w-4" /></Button>
        <Button variant="outline" onClick={() => setBlankOpen(true)} disabled={mode === "preview"}><FilePlus2 className="mr-2 h-4 w-4" />Création vierge</Button>
        <Button onClick={() => void onExport()} disabled={exporting || !ready}><Download className="mr-2 h-4 w-4" />{exporting ? "Export…" : "Exporter PNG"}</Button>
      </StudioHeader>
      <StudioModeSwitch value={mode} onChange={setMode} />

      {/* Workspace */}
      <div className={`grid min-h-0 flex-1 items-start gap-3 ${mode === "edit" ? "xl:grid-cols-[220px_minmax(0,1fr)_300px]" : "mx-auto w-full max-w-[1200px]"}`}>
      <section aria-label="Modèles prêts à personnaliser" className={`space-y-3 rounded-2xl border border-border/60 bg-card/60 p-3 xl:sticky xl:top-20 ${mode === "preview" ? "hidden" : ""}`}>
        <div className="px-1 py-1"><h2 className="text-[10px] font-semibold uppercase tracking-[.18em] text-muted-foreground">Compositions</h2><p className="mt-1 text-[11px] text-muted-foreground">Tes images et tes titres suivent le modèle.</p></div>
        <div className="grid grid-cols-2 gap-2 xl:grid-cols-1">
          {THUMBNAIL_TEMPLATES.filter(t => t.studio).map(t => (
            <TemplateCard key={t.id} id={t.id} label={t.label} description={t.description} active={state.templateId === t.id} onClick={() => {
              const next = createStudioState(t.id, state)
              setState(next)
              setSelected(next.texts[0]?.id ?? null)
            }} />
          ))}
        </div>
      </section>


        {/* Canvas zone */}
        <section className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/40">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 px-4 py-3">
            <div className="text-xs text-muted-foreground">
              {mode === "preview" ? "Aperçu du rendu final" : "Sélectionne · déplace · redimensionne"}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {mode === "preview" ? "Rendu final sans repères" : "Flèches : déplacer · Maj : accélérer"}
            </div>
          </div>
          <div className="flex min-h-[420px] flex-1 items-center justify-center bg-[#090c13] p-5 sm:p-8">
            <div className="w-full max-w-[1280px]">
              <ThumbnailStage
                canvasRef={canvasRef}
                state={state}
                selected={selected}
                onSelect={selectItem}
                onRectChange={onRectChange}
                preview={mode === "preview"}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 px-4 py-3">
            <div className="flex flex-wrap gap-2"><Button size="sm" variant="secondary" disabled={mode === "preview"} onClick={addText}><Plus className="mr-1 h-3 w-3" />Texte</Button><Button size="sm" variant="ghost" onClick={() => setMobilePreview(v => !v)}>{mobilePreview ? "Masquer l’aperçu mobile" : "Vérifier sur mobile"}</Button></div>
            <span className="text-[11px] text-muted-foreground">1280 × 720 · 16:9</span>
          </div>
          {mobilePreview && <div className="mx-auto mb-4 w-full max-w-[320px] overflow-hidden rounded-xl border border-border bg-card"><StudioPreview state={state} /><div className="p-3"><p className="text-sm font-semibold">{state.texts.filter(t => t.kind === "text").map(t => t.text).join(" ") || "Ta prochaine vidéo"}</p><p className="mt-1 text-xs text-muted-foreground">Aperçu de lisibilité</p></div></div>}
        </section>

        {/* Side panel */}
        <aside className={`flex min-h-[420px] flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/60 xl:sticky xl:top-20 xl:max-h-[calc(100vh-7rem)] ${mode === "preview" ? "hidden" : ""}`}>
          <div className="grid grid-cols-4 gap-1 border-b border-border/60 p-2">
            {PANEL_TABS.map((tab) => {
              const active = panel === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setPanel(tab.id)}
                  className={[
                    "flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-[11px] font-medium transition",
                    active
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  ].join(" ")}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              )
            })}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {panel === "layers" ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Images
                  </div>
                  {[...IMAGE_LAYER_STACK].reverse().map((id) => {
                    const layer = state.layers[id]
                    const active = selected === id
                    return (
                      <div
                        key={id}
                        className={[
                          "flex items-center gap-2 rounded-xl border px-2.5 py-2",
                          active
                            ? "border-primary/50 bg-primary/10"
                            : "border-border/60 bg-background/40",
                        ].join(" ")}
                      >
                        <button
                          type="button"
                          className="min-w-0 flex-1 text-left text-sm font-medium"
                          onClick={() => selectItem(id)}
                        >
                          {IMAGE_LAYER_LABELS[id]}
                        </button>
                        <Button type="button" size="sm" variant="ghost" className="h-8 w-8 shrink-0 p-0" aria-pressed={layer.visible} aria-label={`${layer.visible ? "Masquer" : "Afficher"} ${IMAGE_LAYER_LABELS[id]}`} title={layer.visible ? "Masquer le calque" : "Afficher le calque"} onClick={() => patchImageLayer(id, { visible: !layer.visible })}>{layer.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}</Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          aria-pressed={layer.locked}
                          aria-label={`${layer.locked ? "Déverrouiller" : "Verrouiller"} ${IMAGE_LAYER_LABELS[id]}`}
                          title={layer.locked ? "Déverrouiller le calque" : "Verrouiller le calque"}
                          onClick={() =>
                            patchImageLayer(id, { locked: !layer.locked })
                          }
                        >
                          {layer.locked ? (
                            <Lock className="h-3.5 w-3.5" />
                          ) : (
                            <LockOpen className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    )
                  })}
                </div>

                <div className="space-y-3 border-t border-border/50 pt-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Textes & badges
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={addText}
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" />
                      Texte
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {BADGE_PRESETS.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => addBadge(b.id)}
                        className="rounded-lg px-2 py-2 text-[11px] font-bold tracking-wide shadow-sm"
                        style={{ background: b.bg, color: b.fg }}
                      >
                        + {b.label}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    {state.texts.length === 0 ? (
                      <p className="text-[12px] text-muted-foreground">
                        Aucun texte — ajoute un texte ou un badge.
                      </p>
                    ) : (
                      [...state.texts].reverse().map((t) => {
                        const active = selected === t.id
                        const accent =
                          t.kind === "badge"
                            ? BADGE_PRESETS.find(
                                (b) => b.id === t.badgeVariant,
                              )?.bg
                            : undefined
                        return (
                          <div
                            key={t.id}
                            className={[
                              "flex items-center gap-2 rounded-xl border px-2.5 py-2",
                              active
                                ? "border-primary/50 bg-primary/10"
                                : "border-border/60 bg-background/40",
                            ].join(" ")}
                          >
                            <button
                              type="button"
                              className="min-w-0 flex-1 truncate text-left text-sm font-medium"
                              onClick={() => selectItem(t.id)}
                            >
                              {t.kind === "badge" ? (
                                <span
                                  className="mr-1.5 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold"
                                  style={{
                                    background: accent,
                                    color:
                                      t.badgeVariant === "resume"
                                        ? "#111"
                                        : "#fff",
                                  }}
                                >
                                  {t.text}
                                </span>
                              ) : (
                                <>
                                  <Type className="mr-1 inline h-3.5 w-3.5 opacity-70" />
                                  {t.text || "Texte"}
                                </>
                              )}
                            </button>
                            <Button type="button" size="sm" variant="ghost" className="h-8 w-8 shrink-0 p-0" aria-pressed={t.visible} aria-label={`${t.visible ? "Masquer" : "Afficher"} ${t.text || "Texte"}`} title={t.visible ? "Masquer le calque" : "Afficher le calque"} onClick={() => updateText(t.id, { ...t, visible: !t.visible })}>{t.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}</Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              aria-pressed={t.locked}
                              aria-label={`${t.locked ? "Déverrouiller" : "Verrouiller"} ${t.text || "Texte"}`}
                              title={t.locked ? "Déverrouiller le calque" : "Verrouiller le calque"}
                              onClick={() =>
                                updateText(t.id, {
                                  ...t,
                                  locked: !t.locked,
                                })
                              }
                            >
                              {t.locked ? (
                                <Lock className="h-3.5 w-3.5" />
                              ) : (
                                <LockOpen className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            {panel === "edit" ? (
              selectedText ? (
                <TextControls
                  item={selectedText}
                  onChange={(next) => updateText(selectedText.id, next)}
                  onDelete={() => deleteText(selectedText.id)}
                />
              ) : (
                <div className="space-y-3 py-6 text-center">
                  <Type className="mx-auto h-8 w-8 text-muted-foreground/60" />
                  <p className="text-sm text-muted-foreground">
                    Sélectionne un texte ou un badge sur le canvas (ou dans
                    Calques) pour l’éditer.
                  </p>
                  <div className="flex justify-center gap-2">
                    <Button type="button" size="sm" onClick={addText}>
                      <Plus className="mr-1 h-3.5 w-3.5" />
                      Ajouter un texte
                    </Button>
                  </div>
                </div>
              )
            ) : null}

            {panel === "media" ? (
              <div className="space-y-6">
                <div className="rounded-xl border border-primary/15 bg-primary/5 p-3"><p className="text-sm font-medium">Trois changements, une miniature.</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Choisis ton fond, remplace le visage et écris ton titre. Les réglages avancés restent à portée de main.</p></div>
                <FileOrDemo
                  label="Fond (ciné / gameplay)"
                  icon={<ImageIcon className="h-4 w-4" />}
                  demos={THUMBNAIL_DEMO_BACKGROUNDS}
                  currentUrl={state.backgroundUrl}
                  onUrl={(url) => patch({ backgroundUrl: url })}
                />
                <FileOrDemo
                  label="Tête streamer"
                  icon={<User className="h-4 w-4" />}
                  demos={THUMBNAIL_DEMO_HEADS}
                  currentUrl={state.headUrl}
                  onUrl={(url) => {
                    patch({ headUrl: url, layers: { ...state.layers, head: { ...state.layers.head, visible: Boolean(url) } } })
                    selectItem("head")
                  }}
                  extra={
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={!state.headUrl || cutting}
                      onClick={() => void onCutoutHead()}
                    >
                      <Scissors className="mr-1.5 h-3.5 w-3.5" />
                      {cutting ? "Détourage…" : "Détourer fond sombre"}
                    </Button>
                  }
                />
                <div className="space-y-3 border-t border-border/50 pt-4"><h3 className="text-sm font-medium">Ton titre</h3>{state.texts.filter(t => t.kind === "text").map((t, i) => <label key={t.id} className="block space-y-1 text-xs text-muted-foreground">Ligne {i + 1}<Input className="mt-1" value={t.text} onChange={e => updateText(t.id, { ...t, text: e.target.value })} /></label>)}{!state.texts.some(t => t.kind === "text") && <Button size="sm" onClick={addText}>Ajouter un titre</Button>}</div>
                <FileOrDemo
                  label="Élément"
                  icon={<Sparkles className="h-4 w-4" />}
                  demos={THUMBNAIL_DEMO_PROPS}
                  currentUrl={state.propUrl}
                  onUrl={(url) => {
                    setState((prev) => ({
                      ...prev,
                      propUrl: url,
                      layers: {
                        ...prev.layers,
                        prop: {
                          ...prev.layers.prop,
                          visible: Boolean(url),
                        },
                      },
                    }))
                    if (url) selectItem("prop")
                  }}
                />
              </div>
            ) : null}

            {panel === "effects" ? (
              <div className="space-y-5">
                <label className="block text-xs text-muted-foreground">Ambiance violette ({Math.round((state.effects.purpleWash ?? 0) * 100)}%)<input type="range" min={0} max={1} step={.02} value={state.effects.purpleWash ?? 0} onChange={e => patchEffects({ purpleWash: Number(e.target.value) })} className="mt-2 w-full" /></label>
                <label className="block text-[12px] text-muted-foreground">
                  Ombre gauche ({Math.round(state.effects.leftShade * 100)}%)
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.02}
                    value={state.effects.leftShade}
                    onChange={(e) =>
                      patchEffects({ leftShade: Number(e.target.value) })
                    }
                    className="mt-2 w-full"
                  />
                </label>
                <label className="block text-[12px] text-muted-foreground">
                  Voile texte bas-gauche (
                  {Math.round((state.effects.textVeil ?? 0) * 100)}%)
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.02}
                    value={state.effects.textVeil ?? 0}
                    onChange={(e) =>
                      patchEffects({ textVeil: Number(e.target.value) })
                    }
                    className="mt-2 w-full"
                  />
                </label>
                <label className="block text-[12px] text-muted-foreground">
                  Vignette ({Math.round(state.effects.vignette * 100)}%)
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.02}
                    value={state.effects.vignette}
                    onChange={(e) =>
                      patchEffects({ vignette: Number(e.target.value) })
                    }
                    className="mt-2 w-full"
                  />
                </label>
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={state.effects.headShadow}
                    onChange={(e) =>
                      patchEffects({ headShadow: e.target.checked })
                    }
                  />
                  Ombre portée sur la tête
                </label>
                {state.effects.headShadow ? (
                  <>
                    <label className="block text-[12px] text-muted-foreground">
                      Flou ({state.effects.headShadowBlur}px)
                      <input
                        type="range"
                        min={8}
                        max={64}
                        step={1}
                        value={state.effects.headShadowBlur}
                        onChange={(e) =>
                          patchEffects({
                            headShadowBlur: Number(e.target.value),
                          })
                        }
                        className="mt-2 w-full"
                      />
                    </label>
                    <label className="block text-[12px] text-muted-foreground">
                      Intensité (
                      {Math.round(state.effects.headShadowOpacity * 100)}%)
                      <input
                        type="range"
                        min={0.1}
                        max={0.9}
                        step={0.02}
                        value={state.effects.headShadowOpacity}
                        onChange={(e) =>
                          patchEffects({
                            headShadowOpacity: Number(e.target.value),
                          })
                        }
                        className="mt-2 w-full"
                      />
                    </label>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
        </aside>
      </div>

      <p className="text-[11px] leading-relaxed text-muted-foreground">Les cadres de sélection et les repères ne sont pas exportés. <span className="xl:hidden">{saveStatus}</span></p>
      <Dialog open={blankOpen} onOpenChange={setBlankOpen}>
        <DialogContent><DialogHeader><DialogTitle>Partir d’une feuille blanche ?</DialogTitle><DialogDescription>Le brouillon actuel sera remplacé. Tu pourras revenir en arrière avec Annuler.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setBlankOpen(false)}>Garder ma création</Button><Button onClick={() => { setState(createBlankState()); setSelected(null); setPanel("media"); setBlankOpen(false) }}>Créer une miniature vierge</Button></DialogFooter></DialogContent>
      </Dialog>

    </div>
  )
}

function TemplateCard({ id, label, description, active, onClick }: { id: string; label: string; description: string; active: boolean; onClick: () => void }) {
  const preview = React.useMemo(() => createStudioState(id), [id])
  return <button type="button" onClick={onClick} aria-pressed={active} className={`group overflow-hidden rounded-xl border text-left transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-primary ${active ? "border-primary bg-primary/10 ring-1 ring-primary/30" : "border-border bg-card hover:border-primary/50"}`}>
    <div className="relative overflow-hidden"><StudioPreview state={preview} />{active && <span className="absolute right-2 top-2 rounded-full bg-primary p-1 text-primary-foreground"><Check className="h-3 w-3" /></span>}</div>
    <div className="p-3"><p className="text-sm font-semibold">{label}</p><p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{description}</p></div>
  </button>
}
