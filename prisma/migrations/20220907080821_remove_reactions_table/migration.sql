/*
  Warnings:

  - You are about to drop the column `reaction_id` on the `application_stages` table. All the data in the column will be lost.
  - You are about to drop the `reactions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "application_stages" DROP CONSTRAINT "application_stages_reaction_id_fkey";

-- DropIndex
DROP INDEX "application_stages_reaction_id_key";

-- AlterTable
ALTER TABLE "application_stages" DROP COLUMN "reaction_id",
ADD COLUMN     "emoji_unicode_hex" TEXT,
ADD COLUMN     "remark" TEXT;

-- DropTable
DROP TABLE "reactions";
