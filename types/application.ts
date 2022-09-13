import { ApplicationStageApplicationData } from './applicationStage';
import { CompanyData } from './company';
import { RoleData } from './role';
import { TaskData } from './task';
import { RoleApplicationListData } from './role';
import { ApplicationStageApplicationListData } from './applicationStage';
import { ApplicationStageType, RoleType } from '@prisma/client';

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
