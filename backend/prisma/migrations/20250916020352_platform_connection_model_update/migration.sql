/*
  Warnings:

  - A unique constraint covering the columns `[platform,userId]` on the table `PlatformConnection` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `action` on the `CampaignJob` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `SyncJob` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."CampaignJobAction" AS ENUM ('CREATE', 'UPDATE');

-- CreateEnum
CREATE TYPE "public"."SyncJobStatus" AS ENUM ('QUEUED', 'RUNNING', 'SUCCESS', 'FAILED');

-- AlterTable
ALTER TABLE "public"."CampaignJob" DROP COLUMN "action",
ADD COLUMN     "action" "public"."CampaignJobAction" NOT NULL;

-- AlterTable
ALTER TABLE "public"."PlatformConnection" ALTER COLUMN "refreshToken" DROP NOT NULL,
ALTER COLUMN "expiresAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."SyncJob" DROP COLUMN "status",
ADD COLUMN     "status" "public"."SyncJobStatus" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PlatformConnection_platform_userId_key" ON "public"."PlatformConnection"("platform", "userId");
