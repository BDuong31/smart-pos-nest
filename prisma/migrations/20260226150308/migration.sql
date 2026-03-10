/*
  Warnings:

  - The primary key for the `order_tables` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[order_id,table_id]` on the table `order_tables` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `total_item` to the `carts` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `order_tables` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `discount_applied` to the `order_vouchers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "carts" ADD COLUMN     "total_item" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "order_tables" DROP CONSTRAINT "order_tables_pkey",
ADD COLUMN     "id" VARCHAR(36) NOT NULL,
ADD CONSTRAINT "order_tables_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "order_vouchers" ADD COLUMN     "discount_applied" DOUBLE PRECISION NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ordTabUnique" ON "order_tables"("order_id", "table_id");
