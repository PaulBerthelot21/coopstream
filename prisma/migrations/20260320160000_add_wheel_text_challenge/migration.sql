-- CreateTable
CREATE TABLE "WheelTextChallenge" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WheelTextChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WheelTextChallenge_roomId_idx" ON "WheelTextChallenge"("roomId");

-- AddForeignKey
ALTER TABLE "WheelTextChallenge" ADD CONSTRAINT "WheelTextChallenge_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "CoopStreamRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

