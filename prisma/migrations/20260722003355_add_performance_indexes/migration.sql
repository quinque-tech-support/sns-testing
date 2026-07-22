-- CreateIndex
CREATE INDEX "FollowCampaign_userId_idx" ON "FollowCampaign"("userId");

-- CreateIndex
CREATE INDEX "FollowCampaign_accountId_idx" ON "FollowCampaign"("accountId");

-- CreateIndex
CREATE INDEX "FollowTarget_campaignId_idx" ON "FollowTarget"("campaignId");

-- CreateIndex
CREATE INDEX "FollowTarget_status_idx" ON "FollowTarget"("status");

-- CreateIndex
CREATE INDEX "FollowTarget_createdAt_idx" ON "FollowTarget"("createdAt");

-- CreateIndex
CREATE INDEX "Post_instagramMediaId_idx" ON "Post"("instagramMediaId");
