import { ApplicationStageType } from '@prisma/client';
import { Badge } from 'antd';
import React from 'react';
import { stageTypeToDisplayStringMap } from '../../../utils/applicationStage/applicationStageUtils';

function AcceptedBadge() {
  return (
    <Badge
      style={{ backgroundColor: '#5EFF45', color: '#000000' }}
      count={stageTypeToDisplayStringMap.get(ApplicationStageType.ACCEPTED)}
    />
  );
}

export default AcceptedBadge;
