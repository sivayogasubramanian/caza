import { ApplicationStageType } from '@prisma/client';
import { Badge } from 'antd';
import React from 'react';
import { stageTypeToDisplayStringMap } from '../../../utils/applicationStage/applicationStageUtils';

function MixedBadge() {
  return (
    <Badge
      style={{ backgroundColor: '#FEF168 ', color: '#000000' }}
      count={stageTypeToDisplayStringMap.get(ApplicationStageType.MIXED)}
    />
  );
}

export default MixedBadge;
