import { ApplicationStageType } from '@prisma/client';
import { Badge } from 'antd';
import React from 'react';
import { stageTypeToDisplayStringMap } from '../../../utils/applicationStage/applicationStageUtils';

function RejectedBadge() {
  return <Badge count={stageTypeToDisplayStringMap.get(ApplicationStageType.REJECTED)} />;
}

export default RejectedBadge;
