/*
  Warnings:

  - The primary key for the `order_vouchers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[order_id,voucher_id]` on the table `order_vouchers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `order_vouchers` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `code` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cart_items" ADD COLUMN     "variant_id" VARCHAR(36);

-- AlterTable
ALTER TABLE "order_vouchers" DROP CONSTRAINT "order_vouchers_pkey",
ADD COLUMN     "id" VARCHAR(36) NOT NULL,
ADD CONSTRAINT "order_vouchers_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "code" VARCHAR(50) NOT NULL;

-- CreateTable
CREATE TABLE "cart_item_options" (
    "id" VARCHAR(36) NOT NULL,
    "cart_item_id" VARCHAR(36) NOT NULL,
    "option_item_id" VARCHAR(36) NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cart_item_options_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cioItemIdx" ON "cart_item_options"("cart_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "ordVouUnique" ON "order_vouchers"("order_id", "voucher_id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_code_key" ON "orders"("code");
