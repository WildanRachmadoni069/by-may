/*
  Warnings:

  - You are about to drop the column `featured_image` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `descriptionVector` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `mainImage` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `nameVector` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `searchKeywords` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `searchVector` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `seo` on the `Product` table. All the data in the column will be lost.
  - The `additionalImages` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `og_image` on the `SEOSetting` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Product_searchKeywords_idx";

-- AlterTable
ALTER TABLE "Article" DROP COLUMN "featured_image",
ADD COLUMN     "featuredImage" JSONB;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "descriptionVector",
DROP COLUMN "mainImage",
DROP COLUMN "nameVector",
DROP COLUMN "searchKeywords",
DROP COLUMN "searchVector",
DROP COLUMN "seo",
ADD COLUMN     "featuredImage" JSONB,
ADD COLUMN     "meta" JSONB,
DROP COLUMN "additionalImages",
ADD COLUMN     "additionalImages" JSONB[];

-- AlterTable
ALTER TABLE "SEOSetting" DROP COLUMN "og_image",
ADD COLUMN     "ogImage" TEXT;
