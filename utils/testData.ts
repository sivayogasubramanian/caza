// TODO: DELETE THIS FILE

import { ApplicationListData } from '../types/application';
import { ApplicationStageApplicationListData } from '../types/applicationStage';
import { CompanyData } from '../types/company';
import { RoleApplicationListData } from '../types/role';

const company: CompanyData[] = [
  { id: 1, name: 'Google', companyUrl: 'google.com' },
  { id: 2, name: 'Facebook', companyUrl: 'facebook.com' },
  { id: 3, name: 'Amazon', companyUrl: 'amazon.com' },
  { id: 4, name: 'Apple', companyUrl: 'apple.com' },
  { id: 5, name: 'Microsoft', companyUrl: 'microsoft.com' },
];

const roles: RoleApplicationListData[] = [
  { id: 1, company: company[0], title: 'Software Engineer Intern', type: 'SUMMER_INTERNSHIP', year: 2023 },
  { id: 2, company: company[1], title: 'Software Engineer Intern', type: 'FALL_INTERNSHIP', year: 2023 },
  { id: 3, company: company[2], title: 'Software Engineer', type: 'FULL_TIME', year: 2023 },
  { id: 4, company: company[3], title: 'Software Engineer Intern', type: 'WINTER_INTERNSHIP', year: 2023 },
  { id: 5, company: company[4], title: 'Software Engineer Intern', type: 'SUMMER_INTERNSHIP', year: 2023 },
];

const testApplicationStages: ApplicationStageApplicationListData[] = [
  {
    id: 1,
    type: 'OFFERED',
    date: new Date().toJSON(),
    emojiUnicodeHex: '1F610',
  },
  {
    id: 2,
    type: 'ONLINE_ASSESSMENT',
    date: new Date(Date.now() + 3 * 86400000).toJSON(),
    emojiUnicodeHex: '1F614',
  },
  {
    id: 3,
    type: 'REJECTED',
    date: new Date(Date.now() + 5 * 86400000).toJSON(),
    emojiUnicodeHex: null,
  },
  {
    id: 4,
    type: 'WITHDRAWN',
    date: new Date(Date.now() + 10 * 86400000).toJSON(),
    emojiUnicodeHex: null,
  },
];

export const testApplicationList: ApplicationListData[] = [
  {
    id: 1,
    role: roles[0],
    latestStage: testApplicationStages[0],
    taskNotificationCount: 0,
  },
  {
    id: 2,
    role: roles[1],
    latestStage: testApplicationStages[1],
    taskNotificationCount: 3,
  },
  {
    id: 3,
    role: roles[2],
    latestStage: testApplicationStages[2],
    taskNotificationCount: 1,
  },
  {
    id: 4,
    role: roles[3],
    latestStage: testApplicationStages[3],
    taskNotificationCount: 0,
  },
];
