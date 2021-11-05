/*
  Warnings:

  - You are about to drop the column `source` on the `DraftPlugin` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DraftPlugin" DROP COLUMN "source";

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lastModifiedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "publishedId" TEXT NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "File_draftId_key" ON "File"("draftId");

-- CreateIndex
CREATE UNIQUE INDEX "File_publishedId_key" ON "File"("publishedId");

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "DraftPlugin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_publishedId_fkey" FOREIGN KEY ("publishedId") REFERENCES "PublishedPlugin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
