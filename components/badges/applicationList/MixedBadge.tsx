import { ApplicationStageType } from '@prisma/client';
import { Badge } from 'antd';
import React from 'react';
import { stageTypeToDisplayStringMap } from '../../../utils/applicationStage/applicationStageUtils';

function MixedBadge() {
  return (
    <Badge
      style={{ backgroundColor: '#FFE39A', color: '#BC6A1E' }}
      count={stageTypeToDisplayStringMap.get(ApplicationStageType.MIXED)}
    />
  );
}

export default MixedBadge;
