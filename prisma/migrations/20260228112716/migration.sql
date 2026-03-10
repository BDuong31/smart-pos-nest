/*
  Warnings:

  - The values [credit_card,bank_transfer,wallet] on the enum `PaymentMethod` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[external_transaction_id]` on the table `payment_transactions` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentMethod_new" AS ENUM ('cash', 'momo', 'vnpay', 'zalo');
ALTER TABLE "public"."payment_transactions" ALTER COLUMN "method" DROP DEFAULT;
ALTER TABLE "payment_transactions" ALTER COLUMN "method" TYPE "PaymentMethod_new" USING ("method"::text::"PaymentMethod_new");
ALTER TYPE "PaymentMethod" RENAME TO "PaymentMethod_old";
ALTER TYPE "PaymentMethod_new" RENAME TO "PaymentMethod";
DROP TYPE "public"."PaymentMethod_old";
ALTER TABLE "payment_transactions" ALTER COLUMN "method" SET DEFAULT 'cash';
COMMIT;

-- AlterTable
ALTER TABLE "payment_transactions" ADD COLUMN     "external_transaction_id" VARCHAR(100),
ADD COLUMN     "gateway_response" JSONB,
ADD COLUMN     "paid_at" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "payment_transactions_external_transaction_id_key" ON "payment_transactions"("external_transaction_id");
