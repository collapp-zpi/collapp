-- DropForeignKey
ALTER TABLE "DraftPlugin" DROP CONSTRAINT "DraftPlugin_authorId_fkey";

-- DropForeignKey
ALTER TABLE "PluginLog" DROP CONSTRAINT "PluginLog_pluginId_fkey";

-- DropForeignKey
ALTER TABLE "PublishedPlugin" DROP CONSTRAINT "PublishedPlugin_authorId_fkey";

-- DropForeignKey
ALTER TABLE "SpacePlugin" DROP CONSTRAINT "SpacePlugin_pluginId_fkey";

-- AlterTable
ALTER TABLE "PublishedPlugin" ALTER COLUMN "authorId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "DraftPlugin" ADD CONSTRAINT "DraftPlugin_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "DeveloperUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublishedPlugin" ADD CONSTRAINT "PublishedPlugin_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "DeveloperUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PluginLog" ADD CONSTRAINT "PluginLog_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "DraftPlugin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpacePlugin" ADD CONSTRAINT "SpacePlugin_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "PublishedPlugin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
