/*
  Warnings:

  - You are about to drop the column `draftId` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `publishedId` on the `File` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sourceId]` on the table `DraftPlugin` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sourceId]` on the table `PublishedPlugin` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_draftId_fkey";

-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_publishedId_fkey";

-- DropIndex
DROP INDEX "File_draftId_key";

-- DropIndex
DROP INDEX "File_publishedId_key";

-- AlterTable
ALTER TABLE "DraftPlugin" ADD COLUMN     "sourceId" TEXT;

-- AlterTable
ALTER TABLE "File" DROP COLUMN "draftId",
DROP COLUMN "publishedId";

-- AlterTable
ALTER TABLE "PublishedPlugin" ADD COLUMN     "sourceId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "DraftPlugin_sourceId_key" ON "DraftPlugin"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "PublishedPlugin_sourceId_key" ON "PublishedPlugin"("sourceId");

-- AddForeignKey
ALTER TABLE "DraftPlugin" ADD CONSTRAINT "DraftPlugin_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublishedPlugin" ADD CONSTRAINT "PublishedPlugin_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;
