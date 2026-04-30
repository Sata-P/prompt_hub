/*
  Warnings:

  - You are about to drop the column `slug` on the `Prompts` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Prompts_slug_key";

-- AlterTable
ALTER TABLE "Prompts" DROP COLUMN "slug";
