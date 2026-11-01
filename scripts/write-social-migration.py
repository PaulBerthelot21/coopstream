from pathlib import Path

path = Path("prisma/migrations/20261101001000_add_social_links/migration.sql")
path.parent.mkdir(parents=True, exist_ok=True)
content = """-- AlterTable
ALTER TABLE "CoopStreamRoom" ADD COLUMN IF NOT EXISTS "socialYoutube" TEXT;
ALTER TABLE "CoopStreamRoom" ADD COLUMN IF NOT EXISTS "socialTiktok" TEXT;
ALTER TABLE "CoopStreamRoom" ADD COLUMN IF NOT EXISTS "socialInstagram" TEXT;
"""
path.write_bytes(content.encode("ascii"))
print("wrote", path)
