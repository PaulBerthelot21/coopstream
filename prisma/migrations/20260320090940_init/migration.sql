-- CreateTable
CREATE TABLE "CoopStreamRoom" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "selectedChallengeExternalId" TEXT,
    "lastRewardText" TEXT,
    "lastRewardAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoopStreamRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoopStreamChallenge" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "reward" TEXT,
    "current" INTEGER,
    "target" INTEGER,
    "unit" TEXT,
    "skinImageUrl" TEXT,
    "clientUpdatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoopStreamChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CoopStreamRoom_key_key" ON "CoopStreamRoom"("key");

-- CreateIndex
CREATE UNIQUE INDEX "CoopStreamChallenge_roomId_externalId_key" ON "CoopStreamChallenge"("roomId", "externalId");

-- AddForeignKey
ALTER TABLE "CoopStreamChallenge" ADD CONSTRAINT "CoopStreamChallenge_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "CoopStreamRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
