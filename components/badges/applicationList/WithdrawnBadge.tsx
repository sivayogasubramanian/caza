import { ApplicationStageType } from '@prisma/client';
import { Badge } from 'antd';
import React from 'react';
import { stageTypeToDisplayStringMap } from '../../../utils/applicationStage/applicationStageUtils';

function WithdrawnBadge() {
  return (
    <Badge
      style={{ backgroundColor: '#E5E5EE', color: '#6F6F6F' }}
      count={stageTypeToDisplayStringMap.get(ApplicationStageType.WITHDRAWN)}
    />
  );
}

export default WithdrawnBadge;
