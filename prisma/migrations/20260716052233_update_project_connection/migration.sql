-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_accountId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectImage" DROP CONSTRAINT "ProjectImage_projectId_fkey";

-- AlterTable
ALTER TABLE "ProjectImage" ADD COLUMN     "negativePrompt" TEXT,
ADD COLUMN     "prompt" TEXT,
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'AI_GENERATED',
ALTER COLUMN "projectId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "ConnectedAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectImage" ADD CONSTRAINT "ProjectImage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
