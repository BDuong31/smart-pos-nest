/*
  Warnings:

  - The primary key for the `combo_items` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `product_option_configs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[code]` on the table `stock_checks` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `combo_items` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `id` was added to the `product_option_configs` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `code` to the `stock_checks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ImageType" ADD VALUE 'combo';
ALTER TYPE "ImageType" ADD VALUE 'option';

-- AlterTable
ALTER TABLE "combo_items" DROP CONSTRAINT "combo_items_pkey",
ADD COLUMN     "id" VARCHAR(36) NOT NULL,
ADD CONSTRAINT "combo_items_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "product_option_configs" DROP CONSTRAINT "product_option_configs_pkey",
ADD COLUMN     "id" VARCHAR(36) NOT NULL,
ADD CONSTRAINT "product_option_configs_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "stock_checks" ADD COLUMN     "code" VARCHAR(50) NOT NULL;

-- CreateTable
CREATE TABLE "combos" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "price" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "combos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "comboIdx" ON "combo_items"("combo_id");

-- CreateIndex
CREATE INDEX "ProductOptionConfigIdx" ON "product_option_configs"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "stock_checks_code_key" ON "stock_checks"("code");
