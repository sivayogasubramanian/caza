/*
  Warnings:

  - A unique constraint covering the columns `[name,company_url]` on the table `companies` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "companies_name_company_url_key" ON "companies"("name", "company_url");
