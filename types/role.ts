import { Company } from './company';

// See https://github.com/prisma/prisma/discussions/9215
const RoleType: {
  [x: string]: 'WINTER_INTERNSHIP' | 'SPRING_INTERNSHIP' | 'SUMMER_INTERNSHIP' | 'FALL_INTERNSHIP' | 'FULL_TIME';
} = {
  WINTER_INTERNSHIP: 'WINTER_INTERNSHIP',
  SPRING_INTERNSHIP: 'SPRING_INTERNSHIP',
  SUMMER_INTERNSHIP: 'SUMMER_INTERNSHIP',
  FALL_INTERNSHIP: 'FALL_INTERNSHIP',
  FULL_TIME: 'FULL_TIME',
};

export type RoleType = typeof RoleType[keyof typeof RoleType];

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

export type RoleListData = (RoleData & { company: Company; isVerified: boolean })[];
