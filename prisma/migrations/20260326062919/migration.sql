/*
  Warnings:

  - Added the required column `import_invoice_detail_id` to the `inventory_batches` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "inventory_batches" ADD COLUMN     "import_invoice_detail_id" VARCHAR(36) NOT NULL;

-- CreateIndex
CREATE INDEX "batchImportInvoiceDetailIdx" ON "inventory_batches"("import_invoice_detail_id");
