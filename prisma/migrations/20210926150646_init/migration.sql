-- CreateEnum
CREATE TYPE "PluginStatus" AS ENUM ('Private', 'Rejected', 'Pending');

-- CreateTable
CREATE TABLE "Developer" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,

    CONSTRAINT "Developer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DraftPlugin" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "PluginStatus" NOT NULL DEFAULT E'Pending',
    "authorId" TEXT NOT NULL,

    CONSTRAINT "DraftPlugin_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DraftPlugin" ADD CONSTRAINT "DraftPlugin_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Developer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
