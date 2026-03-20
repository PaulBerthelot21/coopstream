import { spawnSync } from "node:child_process"
import path from "node:path"

const fallbackDatabaseUrl =
  "postgresql://johndoe:randompassword@localhost:5432/mydb?schema=public"

// Prisma a besoin de la présence d'un `DATABASE_URL` pour générer le client.
// Sur Vercel, ce n'est pas forcément fourni au moment du build, alors on utilise
// un fallback *uniquement* pour la génération (pas pour exécuter les requêtes).
if (!process.env.DATABASE_URL) process.env.DATABASE_URL = fallbackDatabaseUrl

// Utiliser npx plutôt que prisma.cmd évite les surprises de spawn sur Windows.
const result =
  process.platform === "win32"
    ? spawnSync(
        "cmd.exe",
        [
          "/c",
          "npx prisma generate --schema prisma/schema.prisma",
        ],
        { stdio: "inherit", env: process.env },
      )
    : spawnSync("npx", ["prisma", "generate", "--schema", "prisma/schema.prisma"], {
        stdio: "inherit",
        env: process.env,
      })

if (result.error) {
  console.error("Prisma generate failed:", result.error)
  process.exit(1)
}

if (result.status !== 0) {
  process.exit(result.status ?? 1)
}

