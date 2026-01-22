/*
  Warnings:

  - You are about to drop the column `role_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `roles` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `birthday` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('customer', 'staff', 'kitchen', 'admin');

-- CreateEnum
CREATE TYPE "ImageType" AS ENUM ('category', 'avatar', 'product', 'ingredient');

-- DropIndex
DROP INDEX "roleIdIdx";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role_id",
ADD COLUMN     "birthday" TIMESTAMP(0) NOT NULL,
ADD COLUMN     "fcm_token" TEXT,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'customer';

-- DropTable
DROP TABLE "roles";

-- CreateTable
CREATE TABLE "images" (
    "id" VARCHAR(36) NOT NULL,
    "url" TEXT NOT NULL,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "type" "ImageType" NOT NULL,
    "ref_id" VARCHAR(36) NOT NULL,
    "public_id" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "imageRefIdIdx" ON "images"("ref_id");

-- CreateIndex
CREATE INDEX "role" ON "users"("role");
