export type CompanyListData = {
  id: number;
  name: string;
  companyUrl: string;
};

export type CompanyPostData = {
  name: string;
  companyUrl: string;
};

export type CompanyData = CompanyListData;

export type CompanyQueryParams = {
  companyNames: string[];
};
