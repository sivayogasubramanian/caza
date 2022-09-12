import { RoleType } from '@prisma/client';
import { CompanyData } from './company';

export type RolePostData = {
  companyId: number;
  title: string;
  type: RoleType;
  year: number;
};

export type RoleData = {
  id: number;
  title: string;
  type: RoleType;
  year: number;
};

export type RoleApplicationListData = RoleData & { company: CompanyData };

export type RoleListData = RoleData & { company: CompanyData; isVerified: boolean };

export type RoleQueryParams = {
  companyId?: number;
  searchWords: string[];
};
