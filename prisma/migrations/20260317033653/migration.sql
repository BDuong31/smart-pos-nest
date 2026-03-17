/*
  Warnings:

  - Added the required column `variant_id` to the `combo_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "combo_items" ADD COLUMN     "variant_id" VARCHAR(36) NOT NULL;

-- CreateIndex
CREATE INDEX "comboProductIdx" ON "combo_items"("product_id");

-- CreateIndex
CREATE INDEX "comboVariantIdx" ON "combo_items"("variant_id");
