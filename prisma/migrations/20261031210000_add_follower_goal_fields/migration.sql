-- AlterTable
ALTER TABLE "CoopStreamRoom" ADD COLUMN IF NOT EXISTS "followerGoalTitle" TEXT;
ALTER TABLE "CoopStreamRoom" ADD COLUMN IF NOT EXISTS "followerGoalTarget" INTEGER;
ALTER TABLE "CoopStreamRoom" ADD COLUMN IF NOT EXISTS "followerGoalUnit" TEXT;
