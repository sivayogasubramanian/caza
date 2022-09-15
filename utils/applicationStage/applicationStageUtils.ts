import Immutable from 'immutable';
import { ApplicationStageType } from '@prisma/client';
import AppliedIcon from '../../components/icons/timeline/AppliedIcon';
import OnlineAssessmentIcon from '../../components/icons/timeline/OnlineAssessmentIcon';
import TechnicalIcon from '../../components/icons/timeline/TechnicalIcon';
import NonTechnicalIcon from '../../components/icons/timeline/NonTechnicalIcon';
import MixedIcon from '../../components/icons/timeline/MixedIcon';
import OfferedIcon from '../../components/icons/timeline/OfferedIcon';
import AcceptedIcon from '../../components/icons/timeline/AcceptedIcon';
import RejectedIcon from '../../components/icons/timeline/RejectedIcon';
import WithdrawnIcon from '../../components/icons/timeline/WithdrawnIcon';

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

export const stageTypeToIconMap = Immutable.Map<ApplicationStageType, () => JSX.Element>({
  APPLIED: AppliedIcon,
  ONLINE_ASSESSMENT: OnlineAssessmentIcon,
  TECHNICAL: TechnicalIcon,
  NON_TECHNICAL: NonTechnicalIcon,
  MIXED: MixedIcon,
  OFFERED: OfferedIcon,
  ACCEPTED: AcceptedIcon,
  REJECTED: RejectedIcon,
  WITHDRAWN: WithdrawnIcon,
});
