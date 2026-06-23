-- AlterEnum
ALTER TYPE "MediaType" ADD VALUE 'CAROUSEL';

-- CreateTable
CREATE TABLE "FollowCampaign" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hashtags" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FollowCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FollowTarget" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "authorName" TEXT,
    "postImage" TEXT,
    "postLink" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "followedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FollowTarget_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FollowTarget_userId_accountId_followedAt_idx" ON "FollowTarget"("userId", "accountId", "followedAt");

-- CreateIndex
CREATE UNIQUE INDEX "FollowTarget_userId_postId_key" ON "FollowTarget"("userId", "postId");

-- AddForeignKey
ALTER TABLE "FollowCampaign" ADD CONSTRAINT "FollowCampaign_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowCampaign" ADD CONSTRAINT "FollowCampaign_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "ConnectedAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowTarget" ADD CONSTRAINT "FollowTarget_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "FollowCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowTarget" ADD CONSTRAINT "FollowTarget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowTarget" ADD CONSTRAINT "FollowTarget_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "ConnectedAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
