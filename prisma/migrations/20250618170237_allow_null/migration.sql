-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_receiverUserId_fkey";

-- AlterTable
ALTER TABLE "Match" ALTER COLUMN "receiverUserId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_receiverUserId_fkey" FOREIGN KEY ("receiverUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
