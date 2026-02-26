/*
  Warnings:

  - The `status` column on the `reservations` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('pending', 'confirmed', 'arrived', 'cancelled');

-- AlterTable
ALTER TABLE "reservations" ADD COLUMN     "guest_count" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "note" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "ReservationStatus" NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "tables" ADD COLUMN     "capacity" INTEGER NOT NULL DEFAULT 4,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "zones" ADD COLUMN     "description" TEXT,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;
