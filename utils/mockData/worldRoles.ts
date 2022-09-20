import { ApplicationStageType } from '@prisma/client';
import { WorldRoleListData } from '../../types/role';

export const worldRolesMockData: WorldRoleListData[] = [
  {
    id: 1,
    title: 'Software Engineer Intern',
    type: 'SUMMER_INTERNSHIP',
    year: new Date().getFullYear(),
    isVerified: true,
    company: { id: 1, companyUrl: 'google.com', name: 'Google' },
    applicationStages: [
      { type: ApplicationStageType.APPLIED, count: 105 },
      { type: ApplicationStageType.ONLINE_ASSESSMENT, count: 51 },
      { type: ApplicationStageType.TECHNICAL, count: 32 },
      { type: ApplicationStageType.NON_TECHNICAL, count: 12 },
      { type: ApplicationStageType.OFFERED, count: 4 },
      { type: ApplicationStageType.ACCEPTED, count: 4 },
    ],
  },
  {
    id: 2,
    title: 'Software Engineer Intern',
    type: 'SUMMER_INTERNSHIP',
    year: new Date().getFullYear(),
    isVerified: true,
    company: { id: 2, companyUrl: 'meta.com', name: 'Meta' },
    applicationStages: [
      { type: ApplicationStageType.APPLIED, count: 104 },
      { type: ApplicationStageType.ONLINE_ASSESSMENT, count: 65 },
      { type: ApplicationStageType.TECHNICAL, count: 50 },
      { type: ApplicationStageType.NON_TECHNICAL, count: 50 },
      { type: ApplicationStageType.OFFERED, count: 15 },
      { type: ApplicationStageType.ACCEPTED, count: 10 },
    ],
  },
];
