-- DropForeignKey
ALTER TABLE "Invite" DROP CONSTRAINT "Invite_spaceId_fkey";

-- DropForeignKey
ALTER TABLE "SpacePlugin" DROP CONSTRAINT "SpacePlugin_pluginId_fkey";

-- DropForeignKey
ALTER TABLE "SpacePlugin" DROP CONSTRAINT "SpacePlugin_spaceId_fkey";

-- DropForeignKey
ALTER TABLE "SpaceUser" DROP CONSTRAINT "SpaceUser_spaceId_fkey";

-- DropForeignKey
ALTER TABLE "SpaceUser" DROP CONSTRAINT "SpaceUser_userId_fkey";

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpaceUser" ADD CONSTRAINT "SpaceUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "RegularUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpaceUser" ADD CONSTRAINT "SpaceUser_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpacePlugin" ADD CONSTRAINT "SpacePlugin_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "PublishedPlugin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpacePlugin" ADD CONSTRAINT "SpacePlugin_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;
