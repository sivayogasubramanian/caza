-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "contributor_id" TEXT;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_contributor_id_fkey" FOREIGN KEY ("contributor_id") REFERENCES "users"("uid") ON DELETE SET NULL ON UPDATE CASCADE;
