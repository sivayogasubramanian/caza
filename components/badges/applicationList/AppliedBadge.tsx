import { ApplicationStageType } from '@prisma/client';
import { Badge } from 'antd';
import React from 'react';
import { stageTypeToDisplayStringMap } from '../../../utils/applicationStage/applicationStageUtils';

function AppliedBadge() {
  return (
    <Badge
      style={{ backgroundColor: '#8CB3FF', color: '#1A49A6' }}
      count={stageTypeToDisplayStringMap.get(ApplicationStageType.APPLIED)}
    />
  );
}

export default AppliedBadge;
