-- DropForeignKey
ALTER TABLE "SpacePlugin" DROP CONSTRAINT "SpacePlugin_pluginId_fkey";

-- AlterTable
ALTER TABLE "DraftPlugin" ALTER COLUMN "authorId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PublishedPlugin" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "SpacePlugin" ADD CONSTRAINT "SpacePlugin_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "PublishedPlugin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
