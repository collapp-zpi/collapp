-- AlterTable
ALTER TABLE "DraftPlugin" ADD COLUMN     "isBuilding" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "RegularSession" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegularSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegularUser" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,

    CONSTRAINT "RegularUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegularVerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "RegularAccount" (
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

    CONSTRAINT "RegularAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PluginLog" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "adminId" TEXT,
    "pluginId" TEXT NOT NULL,

    CONSTRAINT "PluginLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Space" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,

    CONSTRAINT "Space_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invite" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "spaceId" TEXT NOT NULL,

    CONSTRAINT "Invite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpaceUser" (
    "isOwner" BOOLEAN NOT NULL DEFAULT false,
    "canEdit" BOOLEAN NOT NULL DEFAULT false,
    "canInvite" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "SpacePlugin" (
    "left" INTEGER NOT NULL,
    "top" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "data" JSONB NOT NULL DEFAULT E'{}',
    "pluginId" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "RegularSession_sessionToken_key" ON "RegularSession"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "RegularUser_email_key" ON "RegularUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RegularVerificationToken_token_key" ON "RegularVerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "RegularVerificationToken_identifier_token_key" ON "RegularVerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "RegularAccount_provider_providerAccountId_key" ON "RegularAccount"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "SpaceUser_userId_spaceId_key" ON "SpaceUser"("userId", "spaceId");

-- CreateIndex
CREATE UNIQUE INDEX "SpacePlugin_pluginId_spaceId_key" ON "SpacePlugin"("pluginId", "spaceId");

-- AddForeignKey
ALTER TABLE "RegularSession" ADD CONSTRAINT "RegularSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "RegularUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegularAccount" ADD CONSTRAINT "RegularAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "RegularUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PluginLog" ADD CONSTRAINT "PluginLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PluginLog" ADD CONSTRAINT "PluginLog_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "DraftPlugin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpaceUser" ADD CONSTRAINT "SpaceUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "RegularUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpaceUser" ADD CONSTRAINT "SpaceUser_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpacePlugin" ADD CONSTRAINT "SpacePlugin_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "PublishedPlugin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpacePlugin" ADD CONSTRAINT "SpacePlugin_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
