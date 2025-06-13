/*
  Warnings:

  - The values [FULFILLED] on the enum `ListingStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `exchangeRate` on the `ExchangeListing` table. All the data in the column will be lost.
  - Added the required column `expiresAt` to the `ExchangeListing` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ListingStatus_new" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELED', 'PENDING', 'EXPIRED', 'DISPUTE');
ALTER TABLE "ExchangeListing" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ExchangeListing" ALTER COLUMN "status" TYPE "ListingStatus_new" USING ("status"::text::"ListingStatus_new");
ALTER TYPE "ListingStatus" RENAME TO "ListingStatus_old";
ALTER TYPE "ListingStatus_new" RENAME TO "ListingStatus";
DROP TYPE "ListingStatus_old";
ALTER TABLE "ExchangeListing" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterTable
ALTER TABLE "ExchangeListing" DROP COLUMN "exchangeRate",
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isSuspended" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "profilePicture" TEXT;

-- CreateIndex
CREATE INDEX "ExchangeListing_userId_idx" ON "ExchangeListing"("userId");

-- CreateIndex
CREATE INDEX "ExchangeListing_amountFrom_idx" ON "ExchangeListing"("amountFrom");

-- CreateIndex
CREATE INDEX "ExchangeListing_type_idx" ON "ExchangeListing"("type");

-- CreateIndex
CREATE INDEX "ExchangeListing_status_idx" ON "ExchangeListing"("status");

-- CreateIndex
CREATE INDEX "ExchangeListing_createdAt_idx" ON "ExchangeListing"("createdAt");

-- CreateIndex
CREATE INDEX "ExchangeListing_expiresAt_idx" ON "ExchangeListing"("expiresAt");
