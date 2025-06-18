/*
  Warnings:

  - You are about to drop the column `initiatorUserId` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `listingId` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the `Transaction` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `initiatorId` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `initiatorListingId` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `matchedListingId` to the `Match` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "MatchStatus" ADD VALUE 'COMPLETED';
ALTER TYPE "MatchStatus" ADD VALUE 'DISPUTED';

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_initiatorUserId_fkey";

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_listingId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_matchId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_receiverUserId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_senderUserId_fkey";

-- AlterTable
ALTER TABLE "Match" DROP COLUMN "initiatorUserId",
DROP COLUMN "listingId",
ADD COLUMN     "initiatorConfirmedCompletion" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "initiatorId" INTEGER NOT NULL,
ADD COLUMN     "initiatorListingId" INTEGER NOT NULL,
ADD COLUMN     "matchedConfirmedCompletion" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "matchedListingId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "isRead" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "Transaction";

-- CreateIndex
CREATE INDEX "Match_initiatorId_idx" ON "Match"("initiatorId");

-- CreateIndex
CREATE INDEX "Match_initiatorListingId_idx" ON "Match"("initiatorListingId");

-- CreateIndex
CREATE INDEX "Match_matchedListingId_idx" ON "Match"("matchedListingId");

-- CreateIndex
CREATE INDEX "Match_status_idx" ON "Match"("status");

-- CreateIndex
CREATE INDEX "Message_matchId_idx" ON "Message"("matchId");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");

-- CreateIndex
CREATE INDEX "User_countryOfResidence_idx" ON "User"("countryOfResidence");

-- CreateIndex
CREATE INDEX "User_countryOfOrigin_idx" ON "User"("countryOfOrigin");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_initiatorListingId_fkey" FOREIGN KEY ("initiatorListingId") REFERENCES "ExchangeListing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_initiatorId_fkey" FOREIGN KEY ("initiatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_matchedListingId_fkey" FOREIGN KEY ("matchedListingId") REFERENCES "ExchangeListing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
