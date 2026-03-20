import { toNextJsHandler } from "better-auth/next-js"

import { auth } from "@/lib/auth"

// Mount Better Auth under `/api/auth/*` (ex: `/api/auth/get-session`, `/api/auth/callback/twitch`).
export const { GET, POST, PATCH, PUT, DELETE } = toNextJsHandler(auth)

