"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft, Eye, MousePointer2 } from "lucide-react"

export type StudioMode = "edit" | "preview"

export function StudioHeader({ title, section, status, children }: { title: string; section: string; status: string; children: ReactNode }) {
  return <header className="flex flex-wrap items-center justify-between gap-4">
    <div className="flex items-center gap-4"><Link href="/studio" aria-label="Retour au Studio" className="rounded-xl border border-border/60 p-2.5 text-muted-foreground hover:bg-muted"><ArrowLeft className="h-4 w-4" /></Link><div><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-primary">Studio / {section}</p><h1 className="text-xl font-semibold tracking-tight">{title}</h1></div></div>
    <div className="flex flex-wrap items-center gap-2"><span role="status" className="mr-3 hidden text-[11px] text-muted-foreground xl:block">{status}</span>{children}</div>
  </header>
}

export function StudioModeSwitch({ value, onChange }: { value: StudioMode; onChange: (mode: StudioMode) => void }) {
  return <div role="group" aria-label="Mode de l’éditeur" className="inline-flex rounded-xl border border-border/60 bg-card/60 p-1">{([['edit', 'Édition', MousePointer2], ['preview', 'Aperçu', Eye]] as const).map(([mode, label, Icon]) => <button key={mode} type="button" aria-pressed={value === mode} onClick={() => onChange(mode)} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition ${value === mode ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted"}`}><Icon className="h-3.5 w-3.5" />{label}</button>)}</div>
}
