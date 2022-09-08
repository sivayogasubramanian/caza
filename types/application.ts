import { ApplicationStageData } from './applicationStage';
import { CompanyData } from './company';
import { RoleData } from './role';
import { TaskData } from './task';

export type ApplicationData = {
  id: number;
  role: RoleData & { company: CompanyData };
  applicationStages: ApplicationStageData[];
  tasks: TaskData[];
};
