"use client"

import { useId } from "react"
import { Check, type LucideIcon } from "lucide-react"

type Choice<T extends string> = { value: T; label: string; icon: LucideIcon; detail?: string }

export function IconChoices<T extends string>({ label, value, options, onChange, columns = 1, disabled = false }: {
  label: string; value: T; options: readonly Choice<T>[]; onChange: (value: T) => void; columns?: 1 | 2 | 3; disabled?: boolean
}) {
  const name = useId()
  return <fieldset disabled={disabled} className="min-w-0 space-y-2 disabled:opacity-50">
    <legend className="mb-2 text-xs text-muted-foreground">{label}</legend>
    <div className={`grid gap-2 ${columns === 3 ? "grid-cols-3" : columns === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
      {options.map(option => {
        const Icon = option.icon, active = value === option.value
        return <label key={option.value} className="relative min-w-0 cursor-pointer">
          <input type="radio" name={name} value={option.value} checked={active} onChange={() => onChange(option.value)} aria-label={option.label} className="peer sr-only" />
          <span className={`flex h-full min-w-0 gap-2.5 rounded-xl border p-3 transition peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary peer-disabled:cursor-not-allowed ${columns > 1 ? "flex-col items-center text-center" : "items-center"} ${active ? "border-primary/50 bg-primary/10" : "border-border/60 bg-background/30 hover:border-primary/30 hover:bg-muted/50"}`}>
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${active ? "bg-primary/15 text-primary" : "bg-muted/60 text-muted-foreground"}`}><Icon aria-hidden="true" className="h-4 w-4" /></span>
            <span className="min-w-0 flex-1"><span className={`block text-[11px] font-medium leading-snug ${active ? "text-primary" : "text-foreground"}`}>{option.label}</span>{option.detail && <span className="mt-1 block text-[10px] leading-relaxed text-muted-foreground">{option.detail}</span>}</span>
            {columns === 1 && active && <Check aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-primary" />}
          </span>
        </label>
      })}
    </div>
  </fieldset>
}
