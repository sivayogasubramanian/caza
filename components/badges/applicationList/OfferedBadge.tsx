import { ApplicationStageType } from '@prisma/client';
import { Badge } from 'antd';
import React from 'react';
import { stageTypeToDisplayStringMap } from '../../../utils/applicationStage/applicationStageUtils';

function OfferedBadge() {
  return (
    <Badge
      style={{ backgroundColor: '#ACFFAE', color: '#000000' }}
      count={stageTypeToDisplayStringMap.get(ApplicationStageType.OFFERED)}
    />
  );
}

export default OfferedBadge;
