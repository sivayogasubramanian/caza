import { ApplicationStageType } from '@prisma/client';
import Immutable from 'immutable';
import AcceptedBadge from '../../components/badges/applicationList/AcceptedBadge';
import AppliedBadge from '../../components/badges/applicationList/AppliedBadge';
import MixedBadge from '../../components/badges/applicationList/MixedBadge';
import NonTechnicalBadge from '../../components/badges/applicationList/NonTechnicalBadge';
import OfferedBadge from '../../components/badges/applicationList/OfferedBadge';
import OnlineAssessmentBadge from '../../components/badges/applicationList/OnlineAssessmentBadge';
import RejectedBadge from '../../components/badges/applicationList/RejectedBadge';
import TechnicalBadge from '../../components/badges/applicationList/TechnicalBadge';
import WithdrawnBadge from '../../components/badges/applicationList/WithdrawnBadge';
import AcceptedIcon from '../../components/icons/timeline/AcceptedIcon';
import AppliedIcon from '../../components/icons/timeline/AppliedIcon';
import MixedIcon from '../../components/icons/timeline/MixedIcon';
import NonTechnicalIcon from '../../components/icons/timeline/NonTechnicalIcon';
import OfferedIcon from '../../components/icons/timeline/OfferedIcon';
import OnlineAssessmentIcon from '../../components/icons/timeline/OnlineAssessmentIcon';
import RejectedIcon from '../../components/icons/timeline/RejectedIcon';
import TechnicalIcon from '../../components/icons/timeline/TechnicalIcon';
import WithdrawnIcon from '../../components/icons/timeline/WithdrawnIcon';

export const stageTypeToDisplayStringMap = Immutable.OrderedMap({
  APPLIED: 'Applied',
  ONLINE_ASSESSMENT: 'Online Assessment',
  TECHNICAL: 'Technical Round',
  NON_TECHNICAL: 'Non Technical Round',
  MIXED: 'Mixed Round',
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

export const stageTypeToBadgeMap = Immutable.Map<ApplicationStageType, () => JSX.Element>({
  APPLIED: AppliedBadge,
  ONLINE_ASSESSMENT: OnlineAssessmentBadge,
  TECHNICAL: TechnicalBadge,
  NON_TECHNICAL: NonTechnicalBadge,
  MIXED: MixedBadge,
  OFFERED: OfferedBadge,
  ACCEPTED: AcceptedBadge,
  REJECTED: RejectedBadge,
  WITHDRAWN: WithdrawnBadge,
});
