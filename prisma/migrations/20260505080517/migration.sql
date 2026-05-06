-- DropForeignKey
ALTER TABLE "notification_reads" DROP CONSTRAINT "notification_reads_notificationId_fkey";

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "isRead" BOOLEAN NOT NULL DEFAULT false;
