/*
  Warnings:

  - You are about to drop the column `contributor_id` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `contributor_id` on the `roles` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[company_id,title,type,year]` on the table `roles` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "companies" DROP CONSTRAINT "companies_contributor_id_fkey";

-- DropForeignKey
ALTER TABLE "roles" DROP CONSTRAINT "roles_contributor_id_fkey";

-- AlterTable
ALTER TABLE "companies" DROP COLUMN "contributor_id";

-- AlterTable
ALTER TABLE "roles" DROP COLUMN "contributor_id";

-- CreateTable
CREATE TABLE "company_contributions" (
    "company_id" INTEGER NOT NULL,
    "contributor_id" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "company_contributions_pkey" PRIMARY KEY ("company_id","contributor_id")
);

-- CreateTable
CREATE TABLE "role_contributions" (
    "role_id" INTEGER NOT NULL,
    "contributor_id" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "role_contributions_pkey" PRIMARY KEY ("role_id","contributor_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_company_id_title_type_year_key" ON "roles"("company_id", "title", "type", "year");

-- AddForeignKey
ALTER TABLE "company_contributions" ADD CONSTRAINT "company_contributions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_contributions" ADD CONSTRAINT "company_contributions_contributor_id_fkey" FOREIGN KEY ("contributor_id") REFERENCES "users"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_contributions" ADD CONSTRAINT "role_contributions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_contributions" ADD CONSTRAINT "role_contributions_contributor_id_fkey" FOREIGN KEY ("contributor_id") REFERENCES "users"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- Trigger to verify a company once there are >= 5 contributors
CREATE OR REPLACE FUNCTION verify_company() RETURNS TRIGGER
AS $$
BEGIN
    IF (SELECT COUNT(*) FROM company_contributions WHERE company_id = NEW.company_id) < 5 THEN
        RETURN NULL;
    END IF;

    UPDATE companies SET is_verified = true WHERE id = NEW.company_id;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER verify_company_trigger AFTER INSERT ON company_contributions
FOR EACH ROW EXECUTE FUNCTION verify_company();

-- Trigger to verify a role once there are >= 5 contributors
CREATE OR REPLACE FUNCTION verify_role() RETURNS TRIGGER
AS $$
BEGIN
    IF (SELECT COUNT(*) FROM role_contributions WHERE role_id = NEW.role_id) < 5 THEN
        RETURN NULL;
    END IF;

    UPDATE roles SET is_verified = true WHERE id = NEW.role_id;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER verify_role_trigger AFTER INSERT ON role_contributions
FOR EACH ROW EXECUTE FUNCTION verify_role();
