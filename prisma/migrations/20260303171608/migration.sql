/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `import_invoices` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `import_invoices` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "import_invoices" ADD COLUMN     "code" VARCHAR(50) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "import_invoices_code_key" ON "import_invoices"("code");
