-- AlterTable
ALTER TABLE "roles" ADD COLUMN     "contributor_id" TEXT;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_contributor_id_fkey" FOREIGN KEY ("contributor_id") REFERENCES "users"("uid") ON DELETE SET NULL ON UPDATE CASCADE;
