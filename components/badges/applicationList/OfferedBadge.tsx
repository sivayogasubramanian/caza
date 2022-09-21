import { ApplicationStageType } from '@prisma/client';
import { Badge } from 'antd';
import React from 'react';
import { stageTypeToDisplayStringMap } from '../../../utils/applicationStage/applicationStageUtils';

function OfferedBadge() {
  return (
    <Badge
      style={{ backgroundColor: '#CEEEC8', color: '#0D7B4D' }}
      count={stageTypeToDisplayStringMap.get(ApplicationStageType.OFFERED)}
    />
  );
}

export default OfferedBadge;
