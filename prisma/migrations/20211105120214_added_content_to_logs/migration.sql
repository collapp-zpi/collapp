/*
  Warnings:

  - Added the required column `content` to the `PluginLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PluginLog" ADD COLUMN     "content" TEXT NOT NULL;

-- RenameIndex
ALTER INDEX "File_draftId_key" RENAME TO "File_draftId_unique";

-- RenameIndex
ALTER INDEX "File_publishedId_key" RENAME TO "File_publishedId_unique";

-- RenameIndex
ALTER INDEX "PublishedPlugin_draftId_key" RENAME TO "PublishedPlugin_draftId_unique";
