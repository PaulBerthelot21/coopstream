import { z } from "zod"
import type { BrandingDesign } from "./render"

const color = z.string().regex(/^#[a-f0-9]{6}$/i)
const image = z.string().max(5000000).regex(/^(data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+)?$/)
const style = z.object({ x: z.number().min(0).max(100), y: z.number().min(0).max(100), size: z.number().min(5).max(300), rotation: z.number().min(-180).max(180), color })
export const BrandingSchema = z.object({
  title: z.string().max(60), subtitle: z.string().max(100), accent: color, background: color,
  template: z.enum(["glow", "minimal", "diagonal"]), image,
  zoom: z.number().min(1).max(3), offsetX: z.number().min(-100).max(100), offsetY: z.number().min(-100).max(100),
  overlay: z.number().min(0).max(80), format: z.enum(["wide", "compact", "panoramic"]), transparent: z.boolean(),
  titleStyle: style.optional(), subtitleStyle: style.optional(),
  assets: z.array(z.object({
    id: z.string().min(1), name: z.string().max(100), image: image.refine(Boolean),
    x: z.number().min(0).max(100), y: z.number().min(0).max(100), size: z.number().min(5).max(200),
    rotation: z.number().min(-180).max(180), opacity: z.number().min(0).max(100), hidden: z.boolean().optional(), locked: z.boolean().optional(),
  })).max(8).default([]),
})
export const initialDesign: BrandingDesign = { title: "TON PSEUDO", subtitle: "Gaming · Live · Communauté", accent: "#8b5cf6", background: "#111827", template: "glow", image: "", zoom: 1, offsetX: 0, offsetY: 0, overlay: 20, format: "compact", transparent: false, assets: [] }
