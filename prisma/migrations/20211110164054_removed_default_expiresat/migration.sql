-- AlterTable
ALTER TABLE "Invite" ALTER COLUMN "expiresAt" DROP DEFAULT;

-- RenameIndex
ALTER INDEX "File_draftId_unique" RENAME TO "File_draftId_key";

-- RenameIndex
ALTER INDEX "File_publishedId_unique" RENAME TO "File_publishedId_key";

-- RenameIndex
ALTER INDEX "PublishedPlugin_draftId_unique" RENAME TO "PublishedPlugin_draftId_key";
