/*
  Warnings:

  - You are about to drop the column `access_token` on the `Session` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Session_access_token_key";

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "access_token";
