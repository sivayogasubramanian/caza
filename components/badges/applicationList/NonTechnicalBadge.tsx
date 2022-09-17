import { ApplicationStageType } from '@prisma/client';
import { Badge } from 'antd';
import React from 'react';
import { stageTypeToDisplayStringMap } from '../../../utils/applicationStage/applicationStageUtils';

function NonTechnicalBadge() {
  return (
    <Badge
      style={{ backgroundColor: '#FF66EF ', color: '#000000' }}
      count={stageTypeToDisplayStringMap.get(ApplicationStageType.NON_TECHNICAL)}
    />
  );
}

export default NonTechnicalBadge;
