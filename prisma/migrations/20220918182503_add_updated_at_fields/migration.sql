/*
  Warnings:

  - Added the required column `updated_at` to the `companies_contributions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `roles_contributions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "companies_contributions" ADD COLUMN     "updated_at" TIMESTAMPTZ(3) NOT NULL;

-- AlterTable
ALTER TABLE "roles_contributions" ADD COLUMN     "updated_at" TIMESTAMPTZ(3) NOT NULL;
