-- DropForeignKey
ALTER TABLE "PublishedPlugin" DROP CONSTRAINT "PublishedPlugin_draftId_fkey";

-- AlterTable
ALTER TABLE "PublishedPlugin" ALTER COLUMN "draftId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "PublishedPlugin" ADD CONSTRAINT "PublishedPlugin_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "DraftPlugin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
