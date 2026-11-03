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

export const PlanningEventSchema = z.object({
  id: z.string().min(1),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).default("22:30"),
  game: z.string().max(70),
  note: z.string().max(90),
  image: z.string().max(700000).regex(/^(data:image\/jpeg;base64,[A-Za-z0-9+/=]+)?$/).default(""),
  imageFit: z.enum(["contain", "cover"]).default("contain"),
  onOtherChannel: z.boolean().default(false),
  channel: z.string().max(60).default(""),
})
export const PlanningDaySchema = z.preprocess(value => {
  if (!value || typeof value !== "object") return value
  const day = value as Record<string, unknown>
  // Upgrade the original one-live-per-day draft without losing its artwork.
  if (!Array.isArray(day.events)) return { ...day, events: [{ ...day, id: "first-live" }] }
  return day
}, z.object({
  status: z.enum(["live", "off", "tba"]),
  events: z.array(PlanningEventSchema).min(1).max(6),
}))
export const PlanningSchema = z.object({
  version: z.literal(1),
  title: z.string().max(45),
  creator: z.string().max(60),
  subtitle: z.string().max(100),
  weekStart: z.string().refine(isCalendarDate),
  template: z.enum(["essential", "paper", "rebrand"]),
  format: z.enum(["landscape", "portrait", "story"]),
  layout: z.enum(["poster", "vertical", "columns", "timeline"]).default("poster"),
  eventView: z.enum(["balanced", "timeline", "posters"]).default("balanced"),
  timelineAxis: z.enum(["horizontal", "vertical"]).default("horizontal"),
  timelineStart: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).default("16:00"),
  timelineEnd: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).default("02:00"),
  hideOff: z.boolean(),
  showDates: z.boolean(),
  days: z.array(PlanningDaySchema).length(7),
})
export type PlanningState = z.infer<typeof PlanningSchema>
export type PlanningDay = z.infer<typeof PlanningDaySchema>
export type PlanningEvent = z.infer<typeof PlanningEventSchema>

export function newPlanningEvent(): PlanningEvent {
  const id = typeof crypto.randomUUID === "function" ? crypto.randomUUID() : Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, "0")).join("")
  return { id, time: "20:30", endTime: "22:30", game: "", note: "", image: "", imageFit: "cover", onOtherChannel: false, channel: "" }
}

export function sortedEvents(day: PlanningDay) {
  // Early-morning lives belong at the end of a streaming day.
  const order = (time: string) => { const [h, m] = time.split(":").map(Number); return ((h + 18) % 24) * 60 + m }
  return [...day.events].sort((a, b) => order(a.time) - order(b.time))
}

export function planningRows(state: PlanningState) {
  return state.days.flatMap((day, index) => {
    if (state.hideOff && day.status === "off") return []
    return (day.status === "live" ? sortedEvents(day) : day.events.slice(0, 1)).map(event => ({ ...event, status: day.status, index }))
  })
}

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
  return DAY_NAMES.map((_, index) => ({ status: "tba", events: [{ ...newPlanningEvent(), id: `day-${index}-first` }] }))
}

export function channelLabel(value: string) {
  const clean = value.trim().replace(/^https?:\/\//i, "").replace(/^(www\.)?twitch\.tv\//i, "").replace(/^@/, "").split("/")[0]
  return /^[a-z0-9_]+$/i.test(clean) ? `@${clean.toLowerCase()}` : value.trim()
}

export function defaultPlanning(): PlanningState {
  const today = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Europe/Paris" }).format(new Date())
  return { version: 1, title: "LE PLANNING", creator: "", subtitle: "On se retrouve en live.", weekStart: mondayOf(today), template: "essential", format: "landscape", layout: "poster", eventView: "balanced", timelineAxis: "horizontal", timelineStart: "16:00", timelineEnd: "02:00", hideOff: false, showDates: true, days: emptyDays() }
}
