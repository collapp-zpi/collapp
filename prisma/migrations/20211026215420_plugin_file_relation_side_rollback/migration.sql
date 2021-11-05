/*
  Warnings:

  - You are about to drop the column `sourceId` on the `DraftPlugin` table. All the data in the column will be lost.
  - You are about to drop the column `sourceId` on the `PublishedPlugin` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[draftId]` on the table `File` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[publishedId]` on the table `File` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "DraftPlugin" DROP CONSTRAINT "DraftPlugin_sourceId_fkey";

-- DropForeignKey
ALTER TABLE "PublishedPlugin" DROP CONSTRAINT "PublishedPlugin_sourceId_fkey";

-- DropIndex
DROP INDEX "DraftPlugin_sourceId_key";

-- DropIndex
DROP INDEX "PublishedPlugin_sourceId_key";

-- AlterTable
ALTER TABLE "DraftPlugin" DROP COLUMN "sourceId";

-- AlterTable
ALTER TABLE "File" ADD COLUMN     "draftId" TEXT,
ADD COLUMN     "publishedId" TEXT;

-- AlterTable
ALTER TABLE "PublishedPlugin" DROP COLUMN "sourceId";

-- CreateIndex
CREATE UNIQUE INDEX "File_draftId_key" ON "File"("draftId");

-- CreateIndex
CREATE UNIQUE INDEX "File_publishedId_key" ON "File"("publishedId");

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "DraftPlugin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_publishedId_fkey" FOREIGN KEY ("publishedId") REFERENCES "PublishedPlugin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
