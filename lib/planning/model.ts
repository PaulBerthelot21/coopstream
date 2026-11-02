import { z } from "zod"

export const DAY_NAMES = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"] as const
export const PLANNING_FORMATS = {
  landscape: { label: "Paysage · 16:9", width: 1920, height: 1080 },
  portrait: { label: "Publication · 4:5", width: 1080, height: 1350 },
  story: { label: "Story · 9:16", width: 1080, height: 1920 },
} as const
export const PLANNING_TEMPLATES = [
  { id: "essential", label: "Essentiel", description: "Sombre et épuré, avec ta couleur d’accent." },
  { id: "paper", label: "Clair", description: "Un fond lumineux et une lecture directe." },
  { id: "rebrand", label: "Le Calme · Rebrand", description: "Marbre violet, lettres blanches et accent pêche." },
] as const

export function isCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = new Date(`${value}T12:00:00Z`)
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}

export const PlanningDaySchema = z.object({
  status: z.enum(["live", "off", "tba"]),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  game: z.string().max(70),
  note: z.string().max(90),
  onOtherChannel: z.boolean().default(false),
  channel: z.string().max(60).default(""),
})
export const PlanningSchema = z.object({
  version: z.literal(1),
  title: z.string().max(45),
  creator: z.string().max(60),
  subtitle: z.string().max(100),
  weekStart: z.string().refine(isCalendarDate),
  template: z.enum(["essential", "paper", "rebrand"]),
  format: z.enum(["landscape", "portrait", "story"]),
  layout: z.enum(["poster", "vertical", "columns"]).default("poster"),
  hideOff: z.boolean(),
  showDates: z.boolean(),
  days: z.array(PlanningDaySchema).length(7),
})
export type PlanningState = z.infer<typeof PlanningSchema>
export type PlanningDay = z.infer<typeof PlanningDaySchema>

export function shiftDate(value: string, days: number) {
  const date = new Date(`${value}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function mondayOf(value: string) {
  const date = new Date(`${value}T12:00:00Z`)
  return shiftDate(value, -((date.getUTCDay() + 6) % 7))
}

export function weekLabel(start: string) {
  const format = (value: string) => new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${value}T12:00:00Z`))
  return `${format(start)} — ${format(shiftDate(start, 6))}`
}

export function emptyDays(): PlanningDay[] {
  return DAY_NAMES.map(() => ({ status: "tba", time: "20:30", game: "", note: "", onOtherChannel: false, channel: "" }))
}

export function channelLabel(value: string) {
  const clean = value.trim().replace(/^https?:\/\//i, "").replace(/^(www\.)?twitch\.tv\//i, "").replace(/^@/, "").split("/")[0]
  return /^[a-z0-9_]+$/i.test(clean) ? `@${clean.toLowerCase()}` : value.trim()
}

export function defaultPlanning(): PlanningState {
  const today = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Europe/Paris" }).format(new Date())
  return { version: 1, title: "LE PLANNING", creator: "", subtitle: "On se retrouve en live.", weekStart: mondayOf(today), template: "essential", format: "landscape", layout: "poster", hideOff: false, showDates: true, days: emptyDays() }
}
