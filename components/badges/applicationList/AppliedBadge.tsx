import { ApplicationStageType } from '@prisma/client';
import { Badge } from 'antd';
import React from 'react';
import { stageTypeToDisplayStringMap } from '../../../utils/applicationStage/applicationStageUtils';

function AppliedBadge() {
  return (
    <Badge
      style={{ backgroundColor: '#C2EBF8', color: '#066DA7' }}
      count={stageTypeToDisplayStringMap.get(ApplicationStageType.APPLIED)}
    />
  );
}

export default AppliedBadge;
