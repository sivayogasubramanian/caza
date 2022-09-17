import { ApplicationStageType } from '@prisma/client';
import { Badge } from 'antd';
import React from 'react';
import { stageTypeToDisplayStringMap } from '../../../utils/applicationStage/applicationStageUtils';

function WithdrawnBadge() {
  return <Badge count={stageTypeToDisplayStringMap.get(ApplicationStageType.WITHDRAWN)} />;
}

export default WithdrawnBadge;
