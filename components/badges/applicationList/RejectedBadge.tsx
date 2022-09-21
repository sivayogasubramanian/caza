import { ApplicationStageType } from '@prisma/client';
import { Badge } from 'antd';
import React from 'react';
import { stageTypeToDisplayStringMap } from '../../../utils/applicationStage/applicationStageUtils';

function RejectedBadge() {
  return (
    <Badge
      style={{ backgroundColor: '#FFC3BF', color: '#8E1100' }}
      count={stageTypeToDisplayStringMap.get(ApplicationStageType.REJECTED)}
    />
  );
}

export default RejectedBadge;
