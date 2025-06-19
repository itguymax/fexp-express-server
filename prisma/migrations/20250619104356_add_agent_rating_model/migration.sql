-- AlterTable
ALTER TABLE "User" ADD COLUMN     "averageRating" DECIMAL(3,2),
ADD COLUMN     "isVerified" BOOLEAN DEFAULT false;

-- CreateTable
CREATE TABLE "AgentRating" (
    "id" SERIAL NOT NULL,
    "agentId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgentRating_agentId_idx" ON "AgentRating"("agentId");

-- AddForeignKey
ALTER TABLE "AgentRating" ADD CONSTRAINT "AgentRating_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
