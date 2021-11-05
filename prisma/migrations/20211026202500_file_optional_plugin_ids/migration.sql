-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_draftId_fkey";

-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_publishedId_fkey";

-- AlterTable
ALTER TABLE "File" ALTER COLUMN "draftId" DROP NOT NULL,
ALTER COLUMN "publishedId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "DraftPlugin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_publishedId_fkey" FOREIGN KEY ("publishedId") REFERENCES "PublishedPlugin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
