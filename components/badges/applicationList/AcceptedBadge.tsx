import { ApplicationStageType } from '@prisma/client';
import { Badge } from 'antd';
import React from 'react';
import { stageTypeToDisplayStringMap } from '../../../utils/applicationStage/applicationStageUtils';

function AcceptedBadge() {
  return (
    <Badge
      style={{ backgroundColor: '#BFE4DE', color: '#034A42' }}
      count={stageTypeToDisplayStringMap.get(ApplicationStageType.ACCEPTED)}
    />
  );
}

export default AcceptedBadge;
