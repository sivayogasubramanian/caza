import { RoleType } from '@prisma/client';
import { CompanyData } from './company';

export const RoleTypeToLabelMap = Object.freeze({
  [RoleType.WINTER_INTERNSHIP]: 'Winter Internship',
  [RoleType.SPRING_INTERNSHIP]: 'Spring Internship',
  [RoleType.SUMMER_INTERNSHIP]: 'Summer Internship',
  [RoleType.FALL_INTERNSHIP]: 'Fall Internship',
  [RoleType.FULL_TIME]: 'Full Time',
});

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
