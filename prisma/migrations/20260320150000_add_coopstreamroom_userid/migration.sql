-- AlterTable
ALTER TABLE "CoopStreamRoom" ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "CoopStreamRoom_userId_key" ON "CoopStreamRoom"("userId");

-- AddForeignKey
ALTER TABLE "CoopStreamRoom" ADD CONSTRAINT "CoopStreamRoom_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

