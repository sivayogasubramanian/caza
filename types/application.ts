import { ApplicationStageType, RoleType } from '@prisma/client';
import { ApplicationStageApplicationData, ApplicationStageApplicationListData } from './applicationStage';
import { CompanyData } from './company';
import { RoleApplicationListData, RoleData } from './role';
import { TaskData } from './task';

export type ApplicationData = {
  id: number;
  role: RoleData & { company: CompanyData };
  applicationStages: ApplicationStageApplicationData[];
  tasks: TaskData[];
};

export type ApplicationRoleData = {
  id: number;
  role: RoleData & { company: CompanyData };
};

export type ApplicationPostData = {
  roleId: number;
  applicationDate: string;
};

export type ApplicationListData = {
  id: number;
  role: RoleApplicationListData;
  latestStage?: ApplicationStageApplicationListData;
  taskNotificationCount: number;
};

export type ApplicationQueryParams = {
  searchWords: string[];
  roleTypeWords: RoleType[];
  stageTypeWords: ApplicationStageType[];
};
