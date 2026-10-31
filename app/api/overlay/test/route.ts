import { NextRequest, NextResponse } from "next/server"

import {
  createOverlayTestEvent,
  type OverlayTestKind,
} from "@/lib/overlay/test-events"
import {
  getOverlayTestEvent,
  setOverlayTestEvent,
} from "@/lib/overlay/test-events-server"

function parseKind(raw: unknown): OverlayTestKind | null {
  if (raw === "follow" || raw === "sub" || raw === "raid") return raw
  return null
}

/** Déclenche un event de test (panneau `/overlay-test`). */
export async function POST(req: NextRequest) {
  let body: { kind?: string; displayName?: string; scopeKey?: string }
  try {
    body = (await req.json()) as typeof body
  } catch {
    return NextResponse.json({ error: "json invalide" }, { status: 400 })
  }

  const kind = parseKind(body.kind)
  if (!kind) {
    return NextResponse.json({ error: "kind invalide" }, { status: 400 })
  }

  const scopeKey = (body.scopeKey ?? "").trim() || "global"
  const event = createOverlayTestEvent(kind, body.displayName)
  setOverlayTestEvent(scopeKey, event)

  return NextResponse.json({ ok: true, event })
}

/** Poll côté overlays OBS (même origine / même scopeKey). */
export async function GET(req: NextRequest) {
  const scopeKey =
    req.nextUrl.searchParams.get("scopeKey")?.trim() || "global"
  const sinceRaw = req.nextUrl.searchParams.get("since")
  const since = sinceRaw ? Number(sinceRaw) : 0

  const event = getOverlayTestEvent(scopeKey)
  if (!event) {
    return NextResponse.json({ event: null })
  }
  if (Number.isFinite(since) && event.at <= since) {
    return NextResponse.json({ event: null })
  }
  return NextResponse.json({ event })
}
