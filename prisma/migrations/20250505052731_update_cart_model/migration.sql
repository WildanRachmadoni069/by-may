/*
  Warnings:

  - You are about to drop the column `image` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the column `selectedOptions` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the column `variationImage` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the column `variationKey` on the `CartItem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,productId,priceVariantId]` on the table `CartItem` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "CartItem_userId_productId_variationKey_key";

-- AlterTable
ALTER TABLE "CartItem" DROP COLUMN "image",
DROP COLUMN "name",
DROP COLUMN "price",
DROP COLUMN "selectedOptions",
DROP COLUMN "variationImage",
DROP COLUMN "variationKey",
ADD COLUMN     "priceVariantId" TEXT;

-- CreateIndex
CREATE INDEX "CartItem_priceVariantId_idx" ON "CartItem"("priceVariantId");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_userId_productId_priceVariantId_key" ON "CartItem"("userId", "productId", "priceVariantId");

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_priceVariantId_fkey" FOREIGN KEY ("priceVariantId") REFERENCES "PriceVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
