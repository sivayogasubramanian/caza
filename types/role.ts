import { ApplicationStageType, RoleType } from '@prisma/client';
import { CompanyData } from './company';
import { Nullable } from './utils';

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

export type WorldRoleListData = RoleData & {
  company: CompanyData;
  applicationStages: { type: ApplicationStageType; count: number }[];
};

export type WorldRoleQueryParams = {
  searchWords: string[];
  roleTypeWords: RoleType[];
  shouldFilterForCurrentUserApplications: boolean;
};

export type RoleAutocompleteOption = {
  role: Nullable<RoleData>;
  label?: JSX.Element;
  value: string;
};

export interface WorldRoleStatsQueryParam {
  roleId: number;
}

export type RoleSankeyNodeId = string;

export type RoleSankeyEdgeData = {
  source: RoleSankeyNodeId;
  dest: RoleSankeyNodeId;
  userCount: number;
  totalNumHours: number;
};

export type WorldRoleStatsData = {
  role: RoleApplicationListData;
  numberOfApplications: number;
  nodes: RoleSankeyNodeId[];
  edges: RoleSankeyEdgeData[];
};
