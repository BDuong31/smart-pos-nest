/*
  Warnings:

  - You are about to drop the column `inventoryEnabled` on the `notification_settings` table. All the data in the column will be lost.
  - You are about to drop the column `orderEnabled` on the `notification_settings` table. All the data in the column will be lost.
  - You are about to drop the column `paymentEnabled` on the `notification_settings` table. All the data in the column will be lost.
  - You are about to drop the column `promotionEnabled` on the `notification_settings` table. All the data in the column will be lost.
  - You are about to drop the column `reservationEnabled` on the `notification_settings` table. All the data in the column will be lost.
  - You are about to drop the column `systemEnabled` on the `notification_settings` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "notifications_createdAt_idx";

-- DropIndex
DROP INDEX "notifications_role_idx";

-- DropIndex
DROP INDEX "notifications_userId_idx";

-- AlterTable
ALTER TABLE "notification_settings" DROP COLUMN "inventoryEnabled",
DROP COLUMN "orderEnabled",
DROP COLUMN "paymentEnabled",
DROP COLUMN "promotionEnabled",
DROP COLUMN "reservationEnabled",
DROP COLUMN "systemEnabled",
ADD COLUMN     "enabled" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "notification_reads_notificationId_idx" ON "notification_reads"("notificationId");

-- CreateIndex
CREATE INDEX "notifications_userId_createdAt_idx" ON "notifications"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "notifications_role_createdAt_idx" ON "notifications"("role", "createdAt");

-- CreateIndex
CREATE INDEX "notifications_isGlobal_createdAt_idx" ON "notifications"("isGlobal", "createdAt");

-- CreateIndex
CREATE INDEX "notifications_refType_refId_idx" ON "notifications"("refType", "refId");
