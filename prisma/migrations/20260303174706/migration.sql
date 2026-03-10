/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `purchase_proposals` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `purchase_proposals` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "purchase_proposals" ADD COLUMN     "code" VARCHAR(50) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "purchase_proposals_code_key" ON "purchase_proposals"("code");
