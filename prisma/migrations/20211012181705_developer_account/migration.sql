/*
  Warnings:

  - You are about to drop the `Developer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DraftPlugin" DROP CONSTRAINT "DraftPlugin_authorId_fkey";

-- DropTable
DROP TABLE "Developer";

-- CreateTable
CREATE TABLE "DeveloperAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "oauth_token_secret" TEXT,
    "oauth_token" TEXT,

    CONSTRAINT "DeveloperAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeveloperSession" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeveloperSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeveloperUser" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,

    CONSTRAINT "DeveloperUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeveloperAccount_provider_providerAccountId_key" ON "DeveloperAccount"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "DeveloperSession_sessionToken_key" ON "DeveloperSession"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "DeveloperUser_email_key" ON "DeveloperUser"("email");

-- AddForeignKey
ALTER TABLE "DraftPlugin" ADD CONSTRAINT "DraftPlugin_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "DeveloperUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeveloperAccount" ADD CONSTRAINT "DeveloperAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "DeveloperUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeveloperSession" ADD CONSTRAINT "DeveloperSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "DeveloperUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
