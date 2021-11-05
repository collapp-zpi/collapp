/*
  Warnings:

  - You are about to drop the column `lastModifiedDate` on the `File` table. All the data in the column will be lost.
  - Added the required column `lastModified` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "File" DROP COLUMN "lastModifiedDate",
ADD COLUMN     "lastModified" INTEGER NOT NULL;
