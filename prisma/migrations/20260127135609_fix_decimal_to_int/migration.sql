/*
  Warnings:

  - You are about to alter the column `unit_price` on the `import_invoice_details` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Integer`.
  - You are about to alter the column `total_cost` on the `import_invoices` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Integer`.
  - You are about to alter the column `price_extra` on the `option_items` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Integer`.
  - You are about to alter the column `price` on the `order_item_options` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Integer`.
  - You are about to alter the column `price` on the `order_items` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Integer`.
  - You are about to alter the column `total_amount` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Integer`.
  - You are about to alter the column `amount` on the `payment_transactions` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Integer`.
  - You are about to alter the column `base_price` on the `products` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Integer`.
  - You are about to alter the column `cash_start` on the `shifts` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Integer`.
  - You are about to alter the column `cash_end` on the `shifts` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Integer`.
  - You are about to alter the column `price_diff` on the `variants` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Integer`.
  - You are about to alter the column `value` on the `vouchers` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Integer`.
  - You are about to alter the column `min_order_val` on the `vouchers` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Integer`.

*/
-- AlterTable
ALTER TABLE "import_invoice_details" ALTER COLUMN "unit_price" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "import_invoices" ALTER COLUMN "total_cost" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "option_items" ALTER COLUMN "price_extra" SET DEFAULT 0,
ALTER COLUMN "price_extra" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "order_item_options" ALTER COLUMN "price" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "order_items" ALTER COLUMN "price" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "orders" ALTER COLUMN "total_amount" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "payment_transactions" ALTER COLUMN "amount" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "products" ALTER COLUMN "base_price" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "shifts" ALTER COLUMN "cash_start" SET DATA TYPE INTEGER,
ALTER COLUMN "cash_end" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "variants" ALTER COLUMN "price_diff" SET DEFAULT 0,
ALTER COLUMN "price_diff" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "vouchers" ALTER COLUMN "value" SET DATA TYPE INTEGER,
ALTER COLUMN "min_order_val" SET DEFAULT 0,
ALTER COLUMN "min_order_val" SET DATA TYPE INTEGER;
