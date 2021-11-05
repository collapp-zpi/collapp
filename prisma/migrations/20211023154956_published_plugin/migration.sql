/*
  Warnings:

  - You are about to drop the column `date` on the `DraftPlugin` table. All the data in the column will be lost.
  - You are about to drop the column `envVars` on the `DraftPlugin` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DraftPlugin" DROP COLUMN "date",
DROP COLUMN "envVars",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "source" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "status" SET DEFAULT E'Private';

-- CreateTable
CREATE TABLE "PublishedPlugin" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "icon" TEXT,
    "authorId" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "minWidth" INTEGER NOT NULL DEFAULT 1,
    "maxWidth" INTEGER NOT NULL DEFAULT 4,
    "minHeight" INTEGER NOT NULL DEFAULT 1,
    "maxHeight" INTEGER NOT NULL DEFAULT 4,

    CONSTRAINT "PublishedPlugin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PublishedPlugin_draftId_key" ON "PublishedPlugin"("draftId");

-- AddForeignKey
ALTER TABLE "PublishedPlugin" ADD CONSTRAINT "PublishedPlugin_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "DeveloperUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublishedPlugin" ADD CONSTRAINT "PublishedPlugin_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "DraftPlugin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
