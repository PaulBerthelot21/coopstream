"use client"

import * as React from "react"
import {
  Download,
  Eye,
  ImageIcon,
  Layers,
  Lock,
  LockOpen,
  Palette,
  Plus,
  RefreshCw,
  Scissors,
  Sparkles,
  Trash2,
  Type,
  User,
} from "lucide-react"
import { toast } from "sonner"

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
  THUMB_H,
  THUMB_W,
  THUMBNAIL_DEMO_BACKGROUNDS,
  THUMBNAIL_DEMO_HEADS,
  THUMBNAIL_DEMO_PROPS,
  THUMBNAIL_FONTS,
  THUMBNAIL_TEMPLATES,
  applyTemplateToState,
  composeThumbnailToCanvas,
  createBadgeItem,
  createTextItem,
  cutoutDarkBackground,
  defaultEditorState,
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

function FileOrDemo({
  label,
  icon,
  demos,
  currentUrl,
  onUrl,
  extra,
}: {
  label: string
  icon: React.ReactNode
  demos: ReadonlyArray<{ id: string; label: string; url: string }>
  currentUrl: string | null
  onUrl: (url: string | null) => void
  extra?: React.ReactNode
}) {
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const objectUrlRef = React.useRef<string | null>(null)

  React.useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    }
  }, [])

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 text-sm font-medium">
        {icon}
        {label}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => inputRef.current?.click()}
        >
          Importer…
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            e.target.value = ""
            if (!file) return
            if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
            const url = URL.createObjectURL(file)
            objectUrlRef.current = url
            onUrl(url)
          }}
        />
        {demos.map((d) => (
          <Button
            key={d.id}
            type="button"
            size="sm"
            variant={currentUrl === d.url ? "default" : "outline"}
            onClick={() => onUrl(d.url)}
          >
            {d.label}
          </Button>
        ))}
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => onUrl(null)}
        >
          Retirer
        </Button>
      </div>
      {extra}
      {currentUrl ? (
        <div className="truncate text-[11px] text-muted-foreground">
          {currentUrl.startsWith("blob:")
            ? "Fichier local (session)"
            : currentUrl.startsWith("data:")
              ? "Tête détourée (session)"
              : currentUrl}
        </div>
      ) : null}
    </div>
  )
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

      <Input
        value={item.text}
        onChange={(e) => patch({ text: e.target.value })}
        placeholder={item.kind === "badge" ? "Label badge" : "Texte"}
        className="h-10 text-base"
      />

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
    defaultEditorState(),
  )
  const [selected, setSelected] = React.useState<SelectedId | null>(() => {
    const first = defaultEditorState().texts[0]
    return first?.id ?? "head"
  })
  const [panel, setPanel] = React.useState<PanelTab>("layers")
  const [exporting, setExporting] = React.useState(false)
  const [cutting, setCutting] = React.useState(false)
  const [previewOpen, setPreviewOpen] = React.useState(false)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const [previewBusy, setPreviewBusy] = React.useState(false)
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const drawGen = React.useRef(0)

  React.useEffect(() => {
    void ensureAllThumbnailFonts()
  }, [])

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as Partial<ThumbnailEditorState>
      setState((prev) => ({
        ...prev,
        templateId: parsed.templateId || prev.templateId,
        effects: parsed.effects
          ? {
              ...prev.effects,
              ...parsed.effects,
              textVeil:
                typeof parsed.effects.textVeil === "number"
                  ? parsed.effects.textVeil
                  : prev.effects.textVeil,
            }
          : prev.effects,
        layers: parsed.layers
          ? {
              background: {
                ...prev.layers.background,
                ...parsed.layers.background,
                rect: {
                  ...prev.layers.background.rect,
                  ...(parsed.layers.background?.rect ?? {}),
                },
              },
              head: {
                ...prev.layers.head,
                ...parsed.layers.head,
                rect: {
                  ...prev.layers.head.rect,
                  ...(parsed.layers.head?.rect ?? {}),
                },
              },
              prop: {
                ...prev.layers.prop,
                ...parsed.layers.prop,
                rect: {
                  ...prev.layers.prop.rect,
                  ...(parsed.layers.prop?.rect ?? {}),
                },
              },
            }
          : prev.layers,
        texts:
          Array.isArray(parsed.texts) && parsed.texts.length > 0
            ? parsed.texts.map((t) => ({
                ...t,
                fillMode: t.fillMode ?? "outline",
                tightTracking: t.tightTracking ?? true,
              }))
            : prev.texts,
      }))
      if (Array.isArray(parsed.texts) && parsed.texts[0]) {
        setSelected(parsed.texts[0].id)
      }
    } catch {
      // ignore
    }
  }, [])

  React.useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          templateId: state.templateId,
          effects: state.effects,
          layers: state.layers,
          texts: state.texts,
        }),
      )
    } catch {
      // ignore
    }
  }, [state])

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gen = ++drawGen.current
    void composeThumbnailToCanvas(canvas, { state })
      .then(() => {
        if (gen !== drawGen.current) return
      })
      .catch(() => {
        // ignore
      })
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

  const openPreview = async () => {
    setPreviewBusy(true)
    setPreviewOpen(true)
    try {
      const canvas = document.createElement("canvas")
      await composeThumbnailToCanvas(canvas, { state })
      setPreviewUrl(canvas.toDataURL("image/png"))
    } catch {
      toast.error("Prévisualisation impossible")
      setPreviewOpen(false)
    } finally {
      setPreviewBusy(false)
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
    <div className="flex min-h-[calc(100vh-3rem)] flex-col gap-4">
      {/* Header + actions */}
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border/60 pb-4">
        <div className="min-w-0 space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Miniatures YouTube
          </h1>
          <p className="text-sm text-muted-foreground">
            1280×720 · multi-textes · badges · export PNG
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="default"
            variant="outline"
            onClick={() => {
              const next = defaultEditorState()
              setState(next)
              setSelected(next.texts[0]?.id ?? "head")
              setPanel("layers")
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button
            type="button"
            size="default"
            variant="secondary"
            onClick={() => void openPreview()}
          >
            <Eye className="mr-2 h-4 w-4" />
            Prévisualiser
          </Button>
          <Button
            type="button"
            size="default"
            onClick={() => void onExport()}
            disabled={exporting}
          >
            <Download className="mr-2 h-4 w-4" />
            {exporting ? "Export…" : "Exporter PNG"}
          </Button>
        </div>
      </header>

      {/* Presets compact */}
      <div className="flex flex-wrap gap-2">
        {THUMBNAIL_TEMPLATES.map((t) => {
          const isSel = state.templateId === t.id
          return (
            <button
              key={t.id}
              type="button"
              onClick={() =>
                setState((prev) => applyTemplateToState(prev, t.id))
              }
              className={[
                "rounded-full border px-3.5 py-1.5 text-sm transition",
                isSel
                  ? "border-primary bg-primary/15 font-medium text-foreground"
                  : "border-border/70 bg-background/40 text-muted-foreground hover:border-border hover:text-foreground",
              ].join(" ")}
              title={t.description}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Workspace */}
      <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(0,1fr)_440px]">
        {/* Canvas zone */}
        <section className="flex min-w-0 flex-col gap-3 rounded-2xl border border-border/60 bg-background/50 p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2 px-0.5">
            <div className="text-sm font-medium text-muted-foreground">
              Canvas · glisser / redimensionner
            </div>
            <div className="text-[11px] text-muted-foreground">
              Flèches = nudge · Shift = ×4
            </div>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-[1280px]">
              <ThumbnailStage
                canvasRef={canvasRef}
                state={state}
                selected={selected}
                onSelect={selectItem}
                onRectChange={onRectChange}
              />
            </div>
          </div>
        </section>

        {/* Side panel */}
        <aside className="flex min-h-[420px] flex-col overflow-hidden rounded-2xl border border-border/60 bg-background/60 xl:sticky xl:top-4 xl:max-h-[calc(100vh-6rem)]">
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
                      ? "bg-primary/15 text-foreground"
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
                            ? "border-sky-400/60 bg-sky-400/10"
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
                        <label className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <input
                            type="checkbox"
                            checked={layer.visible}
                            onChange={(e) =>
                              patchImageLayer(id, {
                                visible: e.target.checked,
                              })
                            }
                          />
                          Vis.
                        </label>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
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
                                ? "border-sky-400/60 bg-sky-400/10"
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
                            <label className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <input
                                type="checkbox"
                                checked={t.visible}
                                onChange={(e) =>
                                  updateText(t.id, {
                                    ...t,
                                    visible: e.target.checked,
                                  })
                                }
                              />
                              Vis.
                            </label>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
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
                    patch({ headUrl: url })
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

      {/* Preview dialog — rendu propre sans poignées */}
      <Dialog
        open={previewOpen}
        onOpenChange={(open) => {
          setPreviewOpen(open)
          if (!open) setPreviewUrl(null)
        }}
      >
        <DialogContent className="max-h-[95vh] w-[min(96vw,1320px)] max-w-[1320px] overflow-y-auto sm:max-w-[1320px]">
          <DialogHeader>
            <DialogTitle>Prévisualisation</DialogTitle>
            <DialogDescription>
              Rendu final {THUMB_W}×{THUMB_H} — sans guides d’édition.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-hidden rounded-xl border border-border/60 bg-black">
            {previewBusy || !previewUrl ? (
              <div
                className="flex items-center justify-center text-sm text-muted-foreground"
                style={{ aspectRatio: `${THUMB_W} / ${THUMB_H}` }}
              >
                Rendu en cours…
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Prévisualisation miniature"
                className="h-auto w-full"
                width={THUMB_W}
                height={THUMB_H}
              />
            )}
          </div>
          <DialogFooter className="sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Ce que tu vois = le PNG exporté.
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPreviewOpen(false)}
              >
                Fermer
              </Button>
              <Button
                type="button"
                onClick={() => void onExport()}
                disabled={exporting}
              >
                <Download className="mr-2 h-4 w-4" />
                {exporting ? "Export…" : "Exporter PNG"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
