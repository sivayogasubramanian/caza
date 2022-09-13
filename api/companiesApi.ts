import { ApiPromise } from '../types/apiResponse';
import { CompanyData, CompanyListData, CompanyPostData, CompanyQueryParams } from '../types/company';
import { toQueryString } from '../utils/url';
import api from './api';

export const COMPANIES_API_ENDPOINT = 'companies';

class CompaniesApi {
  public getCompanies(comapanyQueryParams: CompanyQueryParams): ApiPromise<CompanyListData[]> {
    const queryString = toQueryString(comapanyQueryParams);

    return api.get(`${COMPANIES_API_ENDPOINT}?${queryString}`).then((res) => res.data);
  }

  public createCompany(company: CompanyPostData): ApiPromise<CompanyData> {
    return api.post(COMPANIES_API_ENDPOINT, company).then((res) => res.data);
  }
}

const companiesApi = new CompaniesApi();

export default companiesApi;
