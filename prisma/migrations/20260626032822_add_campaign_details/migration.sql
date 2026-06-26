/*
  Warnings:

  - A unique constraint covering the columns `[userId,campaignId,postId]` on the table `FollowTarget` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "FollowTarget_userId_postId_key";

-- AlterTable
ALTER TABLE "FollowCampaign" ADD COLUMN     "location" TEXT,
ADD COLUMN     "niche" TEXT;

-- AlterTable
ALTER TABLE "FollowTarget" ADD COLUMN     "biography" TEXT,
ADD COLUMN     "followersCount" INTEGER,
ADD COLUMN     "mediaCount" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "FollowTarget_userId_campaignId_postId_key" ON "FollowTarget"("userId", "campaignId", "postId");
