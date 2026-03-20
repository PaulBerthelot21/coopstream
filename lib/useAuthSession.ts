"use client"

import * as React from "react"

import { authClient } from "@/lib/auth.client"

export function useAuthSession() {
  const sessionAtom =
    (authClient as any).useSession ??
    (authClient as any).session ??
    undefined

  const [session, setSession] = React.useState<unknown>(() => {
    try {
      return sessionAtom?.get?.().data ?? null
    } catch {
      return null
    }
  })

  React.useEffect(() => {
    if (!sessionAtom?.subscribe) return
    return sessionAtom.subscribe((value: any) => {
      setSession(value?.data ?? null)
    })
  }, [sessionAtom])

  return session as unknown
}

