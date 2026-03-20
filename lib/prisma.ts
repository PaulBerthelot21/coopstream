import "dotenv/config"

import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

// Hot-reload safe singleton (Next.js dev).
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

// Next.js peut lancer des workers où DATABASE_URL n'est pas toujours injecté.
// On met une valeur de fallback *syntaxiquement valide* uniquement pour permettre
// le démarrage du build; les requêtes échoueront ensuite si la DB n'existe pas.
const fallbackDatabaseUrl =
  "postgresql://johndoe:randompassword@localhost:5432/mydb?schema=public"

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = fallbackDatabaseUrl
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

