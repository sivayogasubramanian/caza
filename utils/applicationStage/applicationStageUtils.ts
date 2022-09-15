import Immutable from 'immutable';
import { ApplicationStageType } from '@prisma/client';

export const stageTypeToDisplayStringMap = Immutable.Map<ApplicationStageType, string>({
  APPLIED: 'Applied',
  ONLINE_ASSESSMENT: 'Online Assessment',
  TECHNICAL: 'Technical',
  NON_TECHNICAL: 'Non Technical',
  MIXED: 'Mixed',
  OFFERED: 'Offered',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
});
