import { ApplicationStageType } from '@prisma/client';
import { Badge } from 'antd';
import React from 'react';
import { stageTypeToDisplayStringMap } from '../../../utils/applicationStage/applicationStageUtils';

function TechnicalBadge() {
  return (
    <Badge
      style={{ backgroundColor: '#FFF6A6', color: '#9B7A05' }}
      count={stageTypeToDisplayStringMap.get(ApplicationStageType.TECHNICAL)}
    />
  );
}

export default TechnicalBadge;
