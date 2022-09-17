import { ApplicationStageType } from '@prisma/client';
import { Badge } from 'antd';
import React from 'react';
import { stageTypeToDisplayStringMap } from '../../../utils/applicationStage/applicationStageUtils';

function RejectedBadge() {
  return (
    <Badge
      style={{ backgroundColor: '#FF9C9C', color: '#000000' }}
      count={stageTypeToDisplayStringMap.get(ApplicationStageType.REJECTED)}
    />
  );
}

export default RejectedBadge;
