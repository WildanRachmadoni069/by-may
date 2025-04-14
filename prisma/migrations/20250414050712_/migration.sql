/*
  Warnings:

  - You are about to drop the column `category` on the `Article` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Article_category_idx";

-- AlterTable
ALTER TABLE "Article" DROP COLUMN "category";
