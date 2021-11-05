/*
  Warnings:

  - You are about to drop the `AdminAccount` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AdminAccount" DROP CONSTRAINT "AdminAccount_userId_fkey";

-- DropTable
DROP TABLE "AdminAccount";
