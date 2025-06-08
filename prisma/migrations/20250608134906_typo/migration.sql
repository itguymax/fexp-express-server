/*
  Warnings:

  - You are about to drop the column `counryOfResidence` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "counryOfResidence",
ADD COLUMN     "countryOfResidence" TEXT;
