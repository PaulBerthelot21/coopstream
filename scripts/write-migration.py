from pathlib import Path

path = Path("prisma/migrations/20261031210000_add_follower_goal_fields/migration.sql")
content = """-- AlterTable
ALTER TABLE "CoopStreamRoom" ADD COLUMN IF NOT EXISTS "followerGoalTitle" TEXT;
ALTER TABLE "CoopStreamRoom" ADD COLUMN IF NOT EXISTS "followerGoalTarget" INTEGER;
ALTER TABLE "CoopStreamRoom" ADD COLUMN IF NOT EXISTS "followerGoalUnit" TEXT;
"""
path.write_bytes(content.encode("ascii"))
print(path.read_bytes()[:40])
