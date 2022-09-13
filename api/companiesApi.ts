import { ApiPromise } from '../types/apiResponse';
import { CompanyData, CompanyListData, CompanyPostData } from '../types/company';
import api from './api';

export const COMPANIES_API_ENDPOINT = 'companies';

class CompaniesApi {
  // TODO: Query params
  public getCompanies(): ApiPromise<CompanyListData[]> {
    return api.get(COMPANIES_API_ENDPOINT).then((res) => res.data);
  }

  public createCompany(company: CompanyPostData): ApiPromise<CompanyData> {
    return api.post(COMPANIES_API_ENDPOINT, company).then((res) => res.data);
  }
}

const companiesApi = new CompaniesApi();

export default companiesApi;
