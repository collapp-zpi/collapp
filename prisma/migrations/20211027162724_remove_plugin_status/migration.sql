/*
  Warnings:

  - You are about to drop the column `status` on the `DraftPlugin` table. All the data in the column will be lost.
  - You are about to drop the column `isPublic` on the `PublishedPlugin` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DraftPlugin" DROP COLUMN "status",
ADD COLUMN     "isPending" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "PublishedPlugin" DROP COLUMN "isPublic";

-- DropEnum
DROP TYPE "PluginStatus";
