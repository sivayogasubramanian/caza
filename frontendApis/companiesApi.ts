import { ApiPromise } from '../types/apiResponse';
import { CompanyData, CompanyListData, CompanyPostData, CompanyQueryParams } from '../types/company';
import api from './api';

export const COMPANIES_API_ENDPOINT = 'companies';

class CompaniesApi {
  public getCompanies(companyQueryParams: CompanyQueryParams): ApiPromise<CompanyListData[]> {
    return api.get(COMPANIES_API_ENDPOINT, { params: companyQueryParams });
  }

  public createCompany(company: CompanyPostData): ApiPromise<CompanyData> {
    return api.post(COMPANIES_API_ENDPOINT, company);
  }
}

const companiesApi = new CompaniesApi();

export default companiesApi;
