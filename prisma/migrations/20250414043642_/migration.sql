/*
  Warnings:

  - You are about to drop the column `featured` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `new` on the `Product` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Product_featured_idx";

-- DropIndex
DROP INDEX "Product_new_idx";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "featured",
DROP COLUMN "new";
